import { z } from 'zod';

export const ProjectBriefContentSchema = z.object({
  problemStatement: z.string().min(20).max(2000),
  targetUser: z.string().min(20).max(1000),
  coreUseCase: z.string().min(20).max(1500),
  mvpGoal: z.string().min(20).max(1500),
  outOfScope: z.array(z.string().min(3).max(300)).max(20),
  keyRisks: z.array(z.string().min(3).max(300)).max(15),
  initialTechStack: z
    .object({
      frontend: z.string().max(300).optional(),
      backend: z.string().max(300).optional(),
      database: z.string().max(300).optional(),
      hosting: z.string().max(300).optional(),
      ai: z.string().max(300).optional(),
      other: z.array(z.string().max(200)).max(10).optional(),
      assumptions: z.array(z.string().min(3).max(300)).max(10).optional(),
    })
    .optional(),
  assumptions: z.array(z.string().min(3).max(300)).max(15).optional(),
});

export type ProjectBriefContent = z.infer<typeof ProjectBriefContentSchema>;

/** Combined model output: structured + markdown. */
export const ProjectBriefModelOutputSchema = z.object({
  content_json: ProjectBriefContentSchema,
  content_markdown: z.string().min(50).max(15000),
});
export type ProjectBriefModelOutput = z.infer<typeof ProjectBriefModelOutputSchema>;

/** Edge Function input. */
export const GenerateProjectBriefInputSchema = z.object({
  projectId: z.string().uuid(),
  answers: z
    .array(
      z.object({
        questionId: z.string().min(1).max(40),
        questionText: z.string().min(5).max(500),
        answer: z.string().trim().min(1).max(1500),
      }),
    )
    .max(10)
    .optional(),
});
export type GenerateProjectBriefInput = z.infer<typeof GenerateProjectBriefInputSchema>;
