import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

import { AiInvalidOutputError, AiProviderError, generate } from '@shared/ai/index.ts';
import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import {
  type FeatureSpecSectionKey,
  RegenerateFeatureSpecSectionInputSchema,
  RegenerateFeatureSpecSectionOutputSchema,
} from '@shared/schemas/feature-spec.ts';

const ChunkSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  ref: z.string().nullable(),
  title: z.string(),
  description: z.string(),
  estimated_effort: z.string(),
});

type Chunk = z.infer<typeof ChunkSchema>;

const SpecContentSchema = z.object({ content_json: z.unknown() });

// Strip the context delimiter from untrusted values so stored copy cannot break out of the
// <spec_context> block and inject instructions.
function sanitize(value: string): string {
  return value.replace(/<\/?spec_context>/gi, '');
}

function buildUserMessage(
  chunk: Chunk,
  currentContentJson: unknown,
  sectionKey: FeatureSpecSectionKey,
  userInstruction: string | undefined,
): string {
  const lines: (string | null)[] = [
    '<spec_context>',
    `Chunk ref: ${chunk.ref ?? '(unknown)'}`,
    `Chunk title: ${sanitize(chunk.title)}`,
    `Chunk description: ${sanitize(chunk.description)}`,
    `Estimated effort: ${chunk.estimated_effort}`,
    '',
    'Current feature spec (structured JSON):',
    sanitize(JSON.stringify(currentContentJson)),
    '',
    `section_to_regenerate: ${sectionKey}`,
    userInstruction && userInstruction.trim().length > 0
      ? `user_instruction: ${sanitize(userInstruction)}`
      : null,
    '</spec_context>',
  ];

  return lines.filter((line): line is string => line !== null).join('\n');
}

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCorsPreflight(req);

  if (preflight) {
    return preflight;
  }

  if (req.method !== 'POST') {
    return fail(
      ERROR_CODES.METHOD_NOT_ALLOWED,
      ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      HTTP_STATUS.METHOD_NOT_ALLOWED,
      req,
    );
  }

  try {
    const { jwt, userId } = await requireAuth(req);
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return fail(
        ERROR_CODES.BAD_REQUEST,
        ERROR_MESSAGES.BAD_REQUEST,
        HTTP_STATUS.BAD_REQUEST,
        req,
      );
    }

    const parsedRequest = RegenerateFeatureSpecSectionInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { chunkId, sectionKey, userInstruction } = parsedRequest.data;
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes both reads to the signed-in user.
    const [chunkRes, specRes] = await Promise.all([
      supabase
        .from('feature_chunks')
        .select('id, project_id, ref, title, description, estimated_effort')
        .eq('id', chunkId)
        .maybeSingle(),
      supabase
        .from('feature_specs')
        .select('content_json')
        .eq('chunk_id', chunkId)
        .maybeSingle(),
    ]);

    if (chunkRes.error || specRes.error) {
      logger.error('feature_spec_section_lookup_failed', {
        userId,
        chunk: chunkRes.error?.code,
        spec: specRes.error?.code,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedChunk = chunkRes.data ? ChunkSchema.safeParse(chunkRes.data) : null;

    // A missing or non-owned chunk reads as null.
    if (!parsedChunk || !parsedChunk.success) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    // A spec must exist before one of its sections can be regenerated.
    const parsedSpec = specRes.data ? SpecContentSchema.safeParse(specRes.data) : null;

    if (!parsedSpec || !parsedSpec.success) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const result = await generate(
      'feature_spec_section_regeneration',
      buildUserMessage(parsedChunk.data, parsedSpec.data.content_json, sectionKey, userInstruction),
      RegenerateFeatureSpecSectionOutputSchema,
    );

    // The schema accepts any valid section; ensure the model returned the requested one.
    if (result.data.sectionKey !== sectionKey) {
      logger.error('feature_spec_section_mismatch', {
        userId,
        requested: sectionKey,
        returned: result.data.sectionKey,
      });
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    // TODO(chunk-27): persist result.meta to generation_logs once usage logging is implemented.
    logger.info('feature_spec_section_regenerated', {
      userId,
      chunkId,
      sectionKey,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens,
      outputTokens: result.meta.outputTokens,
      latencyMs: result.meta.latencyMs,
    });

    return ok(
      { sectionKey: result.data.sectionKey, content: result.data.content },
      HTTP_STATUS.OK,
      req,
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return fail(
        ERROR_CODES.UNAUTHORIZED,
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        req,
      );
    }

    if (error instanceof AiInvalidOutputError) {
      logger.error('feature_spec_section_ai_invalid_output');
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('feature_spec_section_ai_provider_error', {
        provider: error.provider,
        status: error.status,
      });
      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    logger.error('feature_spec_section_unhandled_error');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
