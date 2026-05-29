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

// --- Chunk 16: per-section edit + regenerate + decision-log management ---

export const ArchitectureSectionKeySchema = z.enum([
  'stack_overview',
  'system_diagram_text',
  'components',
  'data_model',
  'external_services',
  'auth_and_security',
  'hosting_and_deployment',
  'decisions',
  'open_questions',
]);
export type ArchitectureSectionKey = z.infer<typeof ArchitectureSectionKeySchema>;

/**
 * Per-section regenerate input. `mode` discriminates the two targets: a whole section
 * (`full_section`) or a single decision by id (`single_decision`). This nested addressing pattern
 * may be reused for per-feature or per-story regenerate in future chunks.
 */
export const RegenerateArchitectureSectionInputSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('full_section'),
    projectId: z.string().uuid(),
    sectionKey: ArchitectureSectionKeySchema,
  }),
  z.object({
    mode: z.literal('single_decision'),
    projectId: z.string().uuid(),
    decisionId: z.string().min(1).max(40),
  }),
]);
export type RegenerateArchitectureSectionInput = z.infer<
  typeof RegenerateArchitectureSectionInputSchema
>;

/**
 * Per-section AI output for `full_section`. Discriminated on `sectionKey` (each variant also carries
 * `mode: 'full_section'`) so `value` is tied to the exact section schema. A flat
 * `discriminatedUnion('mode')` is impossible here because all nine variants would share the same
 * `mode` value — hence the outer `z.union` with the single-decision variant below.
 */
const RegenerateArchitectureFullSectionOutputSchema = z.discriminatedUnion('sectionKey', [
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('stack_overview'),
    value: ArchitectureContentObjectSchema.shape.stack_overview,
  }),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('system_diagram_text'),
    value: ArchitectureContentObjectSchema.shape.system_diagram_text,
  }),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('components'),
    value: ArchitectureContentObjectSchema.shape.components,
  }),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('data_model'),
    value: ArchitectureContentObjectSchema.shape.data_model,
  }),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('external_services'),
    value: ArchitectureContentObjectSchema.shape.external_services,
  }),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('auth_and_security'),
    value: ArchitectureContentObjectSchema.shape.auth_and_security,
  }),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('hosting_and_deployment'),
    value: ArchitectureContentObjectSchema.shape.hosting_and_deployment,
  }),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('decisions'),
    value: ArchitectureContentObjectSchema.shape.decisions,
  }),
  z.object({
    mode: z.literal('full_section'),
    sectionKey: z.literal('open_questions'),
    value: ArchitectureContentObjectSchema.shape.open_questions,
  }),
]);

/** Per-decision AI output: a single regenerated decision, addressed by id. */
const RegenerateArchitectureSingleDecisionOutputSchema = z.object({
  mode: z.literal('single_decision'),
  decisionId: z.string().min(1).max(40),
  value: ArchitectureDecisionSchema,
});

export const RegenerateArchitectureSectionOutputSchema = z.union([
  RegenerateArchitectureFullSectionOutputSchema,
  RegenerateArchitectureSingleDecisionOutputSchema,
]);
export type RegenerateArchitectureSectionOutput = z.infer<
  typeof RegenerateArchitectureSectionOutputSchema
>;

/** Save input. The SPA sends the full new content_json; the server validates, renders markdown, upserts. */
export const SaveArchitectureContentInputSchema = z.object({
  projectId: z.string().uuid(),
  contentJson: ArchitectureContentSchema,
});
export type SaveArchitectureContentInput = z.infer<typeof SaveArchitectureContentInputSchema>;
