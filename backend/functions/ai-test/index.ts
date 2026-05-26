import { z } from 'zod';

import { callProvider as callAnthropic } from '@shared/ai/anthropic.ts';
import { callProvider as callOpenAI } from '@shared/ai/openai.ts';
import { AiProviderError, type GenerationConfig, type Provider } from '@shared/ai/types.ts';
import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';

const RequestSchema = z.object({
  provider: z.enum(['openai', 'anthropic']),
  prompt: z.string().min(1).max(4000),
});

const AI_TEST_CONFIG: Record<Provider, GenerationConfig> = {
  openai: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    systemPrompt: 'Reply concisely to confirm API connectivity.',
    maxOutputTokens: 100,
  },
  anthropic: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt: 'Reply concisely to confirm API connectivity.',
    maxOutputTokens: 100,
  },
};

export async function handler(req: Request): Promise<Response> {
  const preflight = handleCorsPreflight(req);

  if (preflight) {
    return preflight;
  }

  try {
    if (!env.AI_TEST_ENABLED) {
      return fail(
        ERROR_CODES.FEATURE_DISABLED,
        ERROR_MESSAGES.FEATURE_DISABLED,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        req,
      );
    }

    if (req.method !== 'POST') {
      return fail(
        ERROR_CODES.METHOD_NOT_ALLOWED,
        ERROR_MESSAGES.METHOD_NOT_ALLOWED,
        HTTP_STATUS.METHOD_NOT_ALLOWED,
        req,
      );
    }

    await requireAuth(req);

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

    const parsedRequest = RequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const config = AI_TEST_CONFIG[parsedRequest.data.provider];

    // This diagnostic endpoint intentionally tests each provider adapter directly.
    const result = parsedRequest.data.provider === 'openai'
      ? await callOpenAI(config, parsedRequest.data.prompt)
      : await callAnthropic(config, parsedRequest.data.prompt);

    logger.info('AI connectivity test completed.');
    return ok(
      {
        provider: parsedRequest.data.provider,
        model: config.model,
        content: result.content,
        inputTokens: result.inputTokens,
        outputTokens: result.outputTokens,
      },
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

    if (error instanceof AiProviderError) {
      logger.error('AI connectivity test provider call failed.');
      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.SERVICE_UNAVAILABLE,
        req,
      );
    }

    logger.error('Unhandled AI test function error.');
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
