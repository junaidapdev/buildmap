import { z } from 'zod';

export const UserPreferredAgentSchema = z.enum(['claude_code', 'cursor', 'generic']);
export type UserPreferredAgent = z.infer<typeof UserPreferredAgentSchema>;

export const UpdateUserProfileInputSchema = z.object({
  displayName: z.string().min(0).max(120).optional(),
  defaultPreferredAgent: UserPreferredAgentSchema.nullable(),
});
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileInputSchema>;

export const DeleteAccountInputSchema = z.object({
  /** Must match the literal phrase "delete my account" exactly. */
  confirmation: z.literal('delete my account'),
});
export type DeleteAccountInput = z.infer<typeof DeleteAccountInputSchema>;

export const UserProfileRowSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable(),
  default_preferred_agent: UserPreferredAgentSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type UserProfileRow = z.infer<typeof UserProfileRowSchema>;
