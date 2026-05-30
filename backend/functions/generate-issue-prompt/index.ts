import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { GENERATION_FUNCTION_NAMES } from '@shared/telemetry/function-names.ts';
import { logGeneration } from '@shared/telemetry/log-generation.ts';
import type { SupabaseClient } from '@supabase/supabase-js';

import { AiInvalidOutputError, AiProviderError, generate } from '@shared/ai/index.ts';
import { AuthError, requireAuth } from '@shared/auth/verify.ts';
import { ERROR_CODES, ERROR_MESSAGES } from '@shared/constants/errors.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';
import { handleCorsPreflight } from '@shared/http/cors.ts';
import { fail, ok } from '@shared/http/response.ts';
import { logger } from '@shared/logger.ts';
import { assembleIssuePrompt } from '@shared/markdown/issue-prompt-markdown.ts';
import { FeatureSpecContentSchema } from '@shared/schemas/feature-spec.ts';
import {
  GenerateIssuePromptInputSchema,
  IssuePromptModelOutputSchema,
  type IssueSeverity,
  IssueSeveritySchema,
} from '@shared/schemas/issue.ts';
import { PROJECT_TYPE_VALUES } from '@shared/schemas/project.ts';

// The issue row this Edge Function operates on. chunk_id is the canonical column name (Chunk 04);
// the chunk spec referred to it as related_chunk_id — they are the same field.
const IssueSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  chunk_id: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string(),
  severity: IssueSeveritySchema,
  version: z.number().int().min(1),
});

type Issue = z.infer<typeof IssueSchema>;

const ProjectContextSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable(),
  project_type: z.enum(PROJECT_TYPE_VALUES).nullable(),
  preferred_stack: z.string().max(500).nullable(),
});

type ProjectContext = z.infer<typeof ProjectContextSchema>;

const ArchitectureDocSchema = z.object({ content: z.string() });

const LinkedChunkSchema = z.object({ title: z.string(), description: z.string() });

const LinkedSpecSchema = z.object({ content_json: FeatureSpecContentSchema });

// Validates the row returned after the Edge Function writes the rendered prompt + version bump.
const IssueRowSchema = z.object({
  id: z.string().uuid(),
  project_id: z.string().uuid(),
  chunk_id: z.string().uuid().nullable(),
  title: z.string(),
  description: z.string(),
  severity: IssueSeveritySchema,
  status: z.enum(['open', 'resolved']),
  corrective_prompt: z.string().nullable(),
  version: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
  resolved_at: z.string().nullable(),
});

const ISSUE_ROW_COLUMNS =
  'id, project_id, chunk_id, title, description, severity, status, corrective_prompt, version, created_at, updated_at, resolved_at';

// Strip the context delimiter from untrusted values so stored copy cannot break out of the
// <issue_context> block and inject instructions.
function sanitize(value: string): string {
  return value.replace(/<\/?issue_context>/gi, '');
}

function severityLabel(severity: IssueSeverity): string {
  switch (severity) {
    case 'low':
      return 'low';
    case 'medium':
      return 'medium';
    case 'high':
      return 'high';
  }
}

function buildUserMessage(args: {
  project: ProjectContext;
  architecture: string;
  issue: Issue;
  linkedChunk: { title: string; description: string } | null;
  linkedSpec: z.infer<typeof FeatureSpecContentSchema> | null;
}): string {
  const { project, architecture, issue, linkedChunk, linkedSpec } = args;

  const lines: (string | null)[] = [
    '<issue_context>',
    `Project name: ${sanitize(project.name)}`,
    project.description ? `Description: ${sanitize(project.description)}` : null,
    project.project_type ? `Type: ${project.project_type}` : null,
    project.preferred_stack ? `Preferred stack: ${sanitize(project.preferred_stack)}` : null,
    '',
    '--- ARCHITECTURE ---',
    architecture ? sanitize(architecture) : '(no architecture on file)',
    '',
    '--- BUG ---',
    `Title: ${sanitize(issue.title)}`,
    `Severity: ${severityLabel(issue.severity)}`,
    `Description: ${sanitize(issue.description)}`,
    '',
  ];

  if (linkedChunk) {
    lines.push('--- LINKED CHUNK ---');
    lines.push(`Title: ${sanitize(linkedChunk.title)}`);
    lines.push(`Description: ${sanitize(linkedChunk.description)}`);
    lines.push('');
  }

  if (linkedSpec) {
    lines.push('--- LINKED CHUNK SPEC ---');
    lines.push(`Goal: ${sanitize(linkedSpec.goal)}`);
    lines.push(`Scope: ${sanitize(linkedSpec.scope)}`);
    lines.push(`Technical requirements: ${sanitize(linkedSpec.technical_requirements)}`);
    lines.push(`Security requirements: ${sanitize(linkedSpec.security_requirements)}`);
    lines.push('');
  }

  lines.push('</issue_context>');

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

  let userId: string | undefined;

  let projectId: string | undefined;

  let supabase: SupabaseClient | undefined;

  try {
    const auth = await requireAuth(req);

    userId = auth.userId;

    const jwt = auth.jwt;
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

    const parsedRequest = GenerateIssuePromptInputSchema.safeParse(body);

    if (!parsedRequest.success) {
      return fail(
        ERROR_CODES.VALIDATION_FAILED,
        ERROR_MESSAGES.VALIDATION_FAILED,
        HTTP_STATUS.UNPROCESSABLE_ENTITY,
        req,
      );
    }

    const { issueId } = parsedRequest.data;
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // RLS scopes this read to the signed-in user; a missing or non-owned issue reads as null.
    const { data: issueRow, error: issueError } = await supabase
      .from('project_issues')
      .select('id, project_id, chunk_id, title, description, severity, version')
      .eq('id', issueId)
      .maybeSingle();

    if (issueError) {
      logger.error('issue_prompt_issue_lookup_failed', { userId, code: issueError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    if (!issueRow) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const parsedIssue = IssueSchema.safeParse(issueRow);

    if (!parsedIssue.success) {
      logger.error('issue_prompt_issue_invalid', {
        userId,
        issueId,
        issueCount: parsedIssue.error.issues.length,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const issue = parsedIssue.data;
    const projectId = issue.project_id;
    const chunkId = issue.chunk_id;

    // Fan out — project, architecture, optional linked chunk + its spec. Each chunk lookup falls
    // through to a uniform { data: null, error: null } when no chunk was linked.
    const [projectRes, archRes, chunkRes, specRes] = await Promise.all([
      supabase
        .from('projects')
        .select('id, name, description, project_type, preferred_stack')
        .eq('id', projectId)
        .maybeSingle(),
      supabase
        .from('project_documents')
        .select('content')
        .eq('project_id', projectId)
        .eq('type', 'architecture')
        .maybeSingle(),
      chunkId
        ? supabase
          .from('feature_chunks')
          .select('title, description')
          .eq('id', chunkId)
          .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      chunkId
        ? supabase
          .from('feature_specs')
          .select('content_json')
          .eq('chunk_id', chunkId)
          .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    ]);

    if (projectRes.error || archRes.error || chunkRes.error || specRes.error) {
      logger.error('issue_prompt_context_lookup_failed', {
        userId,
        projectId,
        project: projectRes.error?.code,
        architecture: archRes.error?.code,
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

    if (!projectRes.data) {
      return fail(ERROR_CODES.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND, HTTP_STATUS.NOT_FOUND, req);
    }

    const parsedProject = ProjectContextSchema.safeParse(projectRes.data);

    if (!parsedProject.success) {
      logger.error('issue_prompt_project_invalid', {
        userId,
        projectId,
        issueCount: parsedProject.error.issues.length,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedArch = archRes.data ? ArchitectureDocSchema.safeParse(archRes.data) : null;
    const architecture = parsedArch?.success ? parsedArch.data.content : '';

    const parsedChunk = chunkRes.data ? LinkedChunkSchema.safeParse(chunkRes.data) : null;
    const linkedChunk = parsedChunk?.success ? parsedChunk.data : null;

    const parsedSpec = specRes.data ? LinkedSpecSchema.safeParse(specRes.data) : null;
    const linkedSpec = parsedSpec?.success ? parsedSpec.data.content_json : null;

    const result = await generate(
      'issue_prompt_generation',
      buildUserMessage({
        project: parsedProject.data,
        architecture,
        issue,
        linkedChunk,
        linkedSpec,
      }),
      IssuePromptModelOutputSchema,
    );

    const fullPrompt = assembleIssuePrompt({
      ai: result.data,
      projectName: parsedProject.data.name,
      issueTitle: issue.title,
      issueDescription: issue.description,
      severity: issue.severity,
      linkedChunkTitle: linkedChunk?.title,
    });

    // Persist the rendered markdown directly. RLS plus the user's JWT keep the update scoped to the
    // owner; no procedure round-trip is needed for the AI write path.
    const nextVersion = issue.version + 1;
    const { data: writtenRow, error: updateError } = await supabase
      .from('project_issues')
      .update({
        corrective_prompt: fullPrompt,
        version: nextVersion,
      })
      .eq('id', issueId)
      .select(ISSUE_ROW_COLUMNS)
      .single();

    if (updateError) {
      logger.error('issue_prompt_update_failed', { userId, projectId, code: updateError.code });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    const parsedRow = IssueRowSchema.safeParse(writtenRow);

    if (!parsedRow.success) {
      logger.error('issue_prompt_row_invalid', {
        userId,
        projectId,
        issueCount: parsedRow.error.issues.length,
      });
      return fail(
        ERROR_CODES.INTERNAL,
        ERROR_MESSAGES.INTERNAL,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        req,
      );
    }

    await logGeneration(supabase, {
      userId: userId!,
      projectId: projectId ?? null,
      functionName: GENERATION_FUNCTION_NAMES.GENERATE_ISSUE_PROMPT,
      provider: result.meta.provider,
      model: result.meta.model,
      inputTokens: result.meta.inputTokens ?? null,
      outputTokens: result.meta.outputTokens ?? null,
      latencyMs: result.meta.latencyMs ?? null,
      success: true,
      errorCode: null,
      metadata: {
        issueId,
        version: parsedRow.data.version,
        promptLength: fullPrompt.length,
      },
    });

    return ok(parsedRow.data, HTTP_STATUS.OK, req);
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
      logger.error('issue_prompt_ai_invalid_output');
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_ISSUE_PROMPT,
          provider: error.provider ?? 'unknown',
          model: error.model ?? 'unknown',
          inputTokens: null,
          outputTokens: null,
          latencyMs: error.latencyMs ?? null,
          success: false,
          errorCode: ERROR_CODES.AI_INVALID_OUTPUT,
          metadata: { reason: error.message },
        });
      }
      return fail(
        ERROR_CODES.AI_INVALID_OUTPUT,
        ERROR_MESSAGES.AI_INVALID_OUTPUT,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    if (error instanceof AiProviderError) {
      logger.error('issue_prompt_ai_provider_error', {
        provider: error.provider,
        status: error.status,
      });
      if (supabase && userId) {
        await logGeneration(supabase, {
          userId,
          projectId: projectId ?? null,
          functionName: GENERATION_FUNCTION_NAMES.GENERATE_ISSUE_PROMPT,
          provider: error.provider ?? 'unknown',
          model: error.model ?? 'unknown',
          inputTokens: null,
          outputTokens: null,
          latencyMs: error.latencyMs ?? null,
          success: false,
          errorCode: ERROR_CODES.AI_PROVIDER_ERROR,
          metadata: { status: error.status, reason: error.message },
        });
      }
      return fail(
        ERROR_CODES.AI_PROVIDER_ERROR,
        ERROR_MESSAGES.AI_PROVIDER_ERROR,
        HTTP_STATUS.BAD_GATEWAY,
        req,
      );
    }

    logger.error('issue_prompt_unhandled_error');
    if (supabase && userId) {
      await logGeneration(supabase, {
        userId,
        projectId: projectId ?? null,
        functionName: GENERATION_FUNCTION_NAMES.GENERATE_ISSUE_PROMPT,
        provider: 'unknown',
        model: 'unknown',
        inputTokens: null,
        outputTokens: null,
        latencyMs: null,
        success: false,
        errorCode: ERROR_CODES.INTERNAL,
        metadata: { reason: error instanceof Error ? error.message : 'unknown' },
      });
    }
    return fail(
      ERROR_CODES.INTERNAL,
      ERROR_MESSAGES.INTERNAL,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      req,
    );
  }
}

Deno.serve(handler);
