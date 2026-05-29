import { z } from 'zod';

/**
 * The seven canonical context files. Each is persisted as its own project_documents row with this
 * value as its `type`. Unlike PRD/architecture, context files are markdown natively: there is no
 * structured content_json, so these schemas validate plain markdown strings rather than objects.
 */
export const ContextFileTypeSchema = z.enum([
  'project_overview',
  'code_standards',
  'ai_workflow_rules',
  'ui_context',
  'agents_md',
  'claude_md',
  'progress_tracker',
]);
export type ContextFileType = z.infer<typeof ContextFileTypeSchema>;

/**
 * AI output for full context-files generation: one JSON object with seven markdown values, one per
 * doc. code_standards is allowed more room (concrete, project-specific rules run long); the rest cap
 * at 20k. The min(100) floor rejects a model that returns a stub for any doc.
 */
export const ContextFilesModelOutputSchema = z.object({
  project_overview: z.string().min(100).max(20000),
  code_standards: z.string().min(100).max(30000),
  ai_workflow_rules: z.string().min(100).max(20000),
  ui_context: z.string().min(100).max(20000),
  agents_md: z.string().min(100).max(20000),
  claude_md: z.string().min(100).max(20000),
  progress_tracker: z.string().min(100).max(20000),
});
export type ContextFilesModelOutput = z.infer<typeof ContextFilesModelOutputSchema>;

/** Edge Function input for full generation (and bulk regenerate-all). */
export const GenerateContextFilesInputSchema = z.object({
  projectId: z.string().uuid(),
});
export type GenerateContextFilesInput = z.infer<typeof GenerateContextFilesInputSchema>;

/**
 * Per-doc regeneration input. `userInstruction` is an optional nudge ("make this more concise",
 * "add a section about testing") the SPA forwards to the model.
 */
export const RegenerateContextDocInputSchema = z.object({
  projectId: z.string().uuid(),
  type: ContextFileTypeSchema,
  userInstruction: z.string().min(0).max(1000).optional(),
});
export type RegenerateContextDocInput = z.infer<typeof RegenerateContextDocInputSchema>;

/** Per-doc regeneration output: the echoed type plus the new markdown for just that doc. */
export const RegenerateContextDocOutputSchema = z.object({
  type: ContextFileTypeSchema,
  content: z.string().min(100).max(30000),
});
export type RegenerateContextDocOutput = z.infer<typeof RegenerateContextDocOutputSchema>;
