import { z } from 'zod';

/** Four canonical learning types: lesson, decision, gotcha, open_question. */
export const LearningTypeSchema = z.enum(['lesson', 'decision', 'gotcha', 'open_question']);
export type LearningType = z.infer<typeof LearningTypeSchema>;

/** A single AI-extracted learning before it is persisted. */
export const GeneratedLearningSchema = z.object({
  type: LearningTypeSchema,
  title: z.string().min(3).max(200),
  content: z.string().min(10).max(2000),
});
export type GeneratedLearning = z.infer<typeof GeneratedLearningSchema>;

/**
 * AI output: a flat learnings array. Empty arrays are allowed (the source had no engineering
 * content). Cap at 30 to catch runaways and stop a model from padding.
 */
export const LearningsModelOutputSchema = z.object({
  learnings: z.array(GeneratedLearningSchema).min(0).max(30),
});
export type LearningsModelOutput = z.infer<typeof LearningsModelOutputSchema>;

/** Edge Function input — the raw paste and optional source label. */
export const ExtractLearningsInputSchema = z.object({
  projectId: z.string().uuid(),
  sourceLabel: z.string().max(200).optional(),
  sourceContent: z.string().min(20).max(50000),
});
export type ExtractLearningsInput = z.infer<typeof ExtractLearningsInputSchema>;

/** Input to the update_learning procedure (partial — all optional). */
export const UpdateLearningInputSchema = z.object({
  learningId: z.string().uuid(),
  title: z.string().min(3).max(200).optional(),
  content: z.string().min(10).max(2000).optional(),
  type: LearningTypeSchema.optional(),
});
export type UpdateLearningInput = z.infer<typeof UpdateLearningInputSchema>;
