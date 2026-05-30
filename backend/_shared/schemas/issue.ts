import { z } from 'zod';

/** Severity is user-set; the AI prompt uses it as a hint, not a gate. */
export const IssueSeveritySchema = z.enum(['low', 'medium', 'high']);
export type IssueSeverity = z.infer<typeof IssueSeveritySchema>;

/** Two-status model: an issue is open until the user explicitly marks it resolved. No auto-resolve. */
export const IssueStatusSchema = z.enum(['open', 'resolved']);
export type IssueStatus = z.infer<typeof IssueStatusSchema>;

/** Input to the create_issue procedure (mirrors the SPA's New Issue dialog). */
export const CreateIssueInputSchema = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().min(20).max(8000),
  severity: IssueSeveritySchema.default('medium'),
  /** Canonical column name on project_issues. The chunk spec calls this related_chunk_id. */
  chunkId: z.string().uuid().nullable().optional(),
});
export type CreateIssueInput = z.infer<typeof CreateIssueInputSchema>;

/** Input to the update_issue procedure. */
export const UpdateIssueInputSchema = z.object({
  issueId: z.string().uuid(),
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(20).max(8000).optional(),
  severity: IssueSeveritySchema.optional(),
  /** null + clearChunk=true means "unlink"; null + clearChunk=false means "no change". */
  chunkId: z.string().uuid().nullable().optional(),
  clearChunk: z.boolean().optional(),
});
export type UpdateIssueInput = z.infer<typeof UpdateIssueInputSchema>;

/** Edge Function input — which issue to draft a corrective prompt for. */
export const GenerateIssuePromptInputSchema = z.object({
  issueId: z.string().uuid(),
});
export type GenerateIssuePromptInput = z.infer<typeof GenerateIssuePromptInputSchema>;

/**
 * AI output for an issue prompt: only the framing portions. The deterministic assembler stitches
 * the user's original bug description and the meta line in around them, so the AI cost stays small
 * even on regeneration.
 */
export const IssuePromptModelOutputSchema = z.object({
  role_intro: z.string().min(50).max(2000),
  what_to_fix: z.string().min(50).max(3000),
  acceptance: z.string().min(20).max(2000),
});
export type IssuePromptModelOutput = z.infer<typeof IssuePromptModelOutputSchema>;
