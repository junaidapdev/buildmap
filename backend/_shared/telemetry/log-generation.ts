import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '../logger.ts';

export type GenerationLogPayload = {
  userId: string;
  projectId: string | null;
  functionName: string;
  provider: string;
  model: string;
  inputTokens: number | null;
  outputTokens: number | null;
  latencyMs: number | null;
  success: boolean;
  errorCode: string | null;
  metadata: Record<string, unknown>;
};

/**
 * Insert a row into `generation_logs`.
 *
 * IMPORTANT:
 * - Do NOT include user content (prompts, AI responses, document text, project names, descriptions).
 * - Only structured metadata (counts, ids, codes, tokens, latency).
 * - Insert is JWT-scoped via the caller's Supabase client; RLS enforces user ownership.
 * - Failures inside this helper are logged via the structured logger and swallowed —
 *   they never propagate to the user-facing response. Telemetry is best-effort.
 */
export async function logGeneration(
  supabase: SupabaseClient,
  payload: GenerationLogPayload,
): Promise<void> {
  try {
    const { error } = await supabase.from('generation_logs').insert({
      user_id: payload.userId,
      project_id: payload.projectId,
      function_name: payload.functionName,
      provider: payload.provider,
      model: payload.model,
      input_tokens: payload.inputTokens,
      output_tokens: payload.outputTokens,
      latency_ms: payload.latencyMs,
      success: payload.success,
      error_code: payload.errorCode,
      metadata: payload.metadata,
    });
    if (error) {
      logger.error('generation_log_insert_failed', {
        code: error.code,
        functionName: payload.functionName,
        success: payload.success,
      });
      // Swallow — telemetry must not affect user-facing response.
    }
  } catch (err) {
    logger.error('generation_log_unexpected_error', {
      message: err instanceof Error ? err.message : 'unknown',
      functionName: payload.functionName,
    });
    // Swallow.
  }
}
