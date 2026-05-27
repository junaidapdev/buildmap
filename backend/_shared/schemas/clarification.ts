import { z } from 'zod';

export const ClarifyingQuestionSchema = z.object({
  id: z.string().min(1).max(40),
  text: z.string().min(5).max(500),
  category: z
    .enum(['problem', 'users', 'scope', 'features', 'tech', 'success_criteria', 'other'])
    .optional(),
  example: z.string().max(300).optional(),
});

export const ClarifyingQuestionsResponseSchema = z
  .object({
    questions: z.array(ClarifyingQuestionSchema).min(5).max(10),
  })
  .superRefine(({ questions }, context) => {
    const ids = new Set<string>();

    questions.forEach((question, index) => {
      if (ids.has(question.id)) {
        context.addIssue({
          code: 'custom',
          message: 'Question ids must be unique.',
          path: ['questions', index, 'id'],
        });
      }

      ids.add(question.id);
    });
  });

export type ClarifyingQuestion = z.infer<typeof ClarifyingQuestionSchema>;
export type ClarifyingQuestionsResponse = z.infer<typeof ClarifyingQuestionsResponseSchema>;

export const GenerateClarifyingQuestionsInputSchema = z.object({
  projectId: z.string().uuid(),
});

export type GenerateClarifyingQuestionsInput = z.infer<
  typeof GenerateClarifyingQuestionsInputSchema
>;
