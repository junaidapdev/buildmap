import { z } from 'zod';

// Stable, lowercase kebab-case id the model assigns so per-section regenerate and the decision log
// management UI (Chunk 16) can address components, services, and decisions by id. Uniqueness is
// enforced on the container schema below.
const StableIdSchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be lowercase kebab-case');

export const ArchitectureDecisionStatusSchema = z.enum([
  'proposed',
  'accepted',
  'superseded',
  'rejected',
]);
export type ArchitectureDecisionStatus = z.infer<typeof ArchitectureDecisionStatusSchema>;

export const ArchitectureDecisionSchema = z.object({
  id: StableIdSchema,
  title: z.string().min(2).max(200),
  context: z.string().min(10).max(2000),
  decision: z.string().min(10).max(2000),
  consequences: z.string().min(10).max(2000),
  status: ArchitectureDecisionStatusSchema,
});
export type ArchitectureDecision = z.infer<typeof ArchitectureDecisionSchema>;

export const ArchitectureComponentSchema = z.object({
  id: StableIdSchema,
  name: z.string().min(2).max(200),
  description: z.string().min(10).max(1500),
  responsibilities: z.array(z.string().min(3).max(500)).min(1).max(15),
});
export type ArchitectureComponent = z.infer<typeof ArchitectureComponentSchema>;

export const ArchitectureExternalServiceSchema = z.object({
  id: StableIdSchema,
  name: z.string().min(2).max(200),
  purpose: z.string().min(5).max(1000),
  notes: z.string().min(0).max(1000).optional(),
});
export type ArchitectureExternalService = z.infer<typeof ArchitectureExternalServiceSchema>;

// Base object schema. Kept separate so future per-section schemas (Chunk 16) can reference `.shape`;
// the exported ArchitectureContentSchema below wraps it with cross-field id uniqueness.
const ArchitectureContentObjectSchema = z.object({
  stack_overview: z.string().min(20).max(3000),
  // Textual description of the system topology — NOT a diagram. Mermaid/ASCII is explicitly excluded.
  system_diagram_text: z.string().min(20).max(5000),
  components: z.array(ArchitectureComponentSchema).min(1).max(40),
  data_model: z.string().min(20).max(5000),
  external_services: z.array(ArchitectureExternalServiceSchema).max(20),
  auth_and_security: z.string().min(20).max(3000),
  hosting_and_deployment: z.string().min(20).max(3000),
  // Min 0: a small project may not need explicit decisions captured, but a non-trivial PRD should
  // usually yield 3-8 (the prompt instructs this).
  decisions: z.array(ArchitectureDecisionSchema).max(50),
  open_questions: z.array(z.string().min(3).max(500)).max(15),
});

export const ArchitectureContentSchema = ArchitectureContentObjectSchema.superRefine(
  (content, ctx) => {
    const seenComponentIds = new Set<string>();
    content.components.forEach((component, index) => {
      if (seenComponentIds.has(component.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Component ids must be unique.',
          path: ['components', index, 'id'],
        });
      }
      seenComponentIds.add(component.id);
    });

    const seenServiceIds = new Set<string>();
    content.external_services.forEach((service, index) => {
      if (seenServiceIds.has(service.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'External service ids must be unique.',
          path: ['external_services', index, 'id'],
        });
      }
      seenServiceIds.add(service.id);
    });

    const seenDecisionIds = new Set<string>();
    content.decisions.forEach((decision, index) => {
      if (seenDecisionIds.has(decision.id)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Decision ids must be unique.',
          path: ['decisions', index, 'id'],
        });
      }
      seenDecisionIds.add(decision.id);
    });
  },
);
export type ArchitectureContent = z.infer<typeof ArchitectureContentSchema>;

/** Combined model output: structured + markdown. */
export const ArchitectureModelOutputSchema = z.object({
  content_json: ArchitectureContentSchema,
  content_markdown: z.string().min(100).max(50000),
});
export type ArchitectureModelOutput = z.infer<typeof ArchitectureModelOutputSchema>;

/** Edge Function input for full generation. */
export const GenerateArchitectureInputSchema = z.object({
  projectId: z.string().uuid(),
});
export type GenerateArchitectureInput = z.infer<typeof GenerateArchitectureInputSchema>;
