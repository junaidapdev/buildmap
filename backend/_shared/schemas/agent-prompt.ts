import { z } from 'zod';

/**
 * The three coding agents the wrapped prompt can target. Mirrors the CHECK constraint on
 * coding_agent_prompts.target_agent. Extending the enum later is a one-line change in three places
 * (this schema, the CHECK, and the upsert procedure whitelist).
 */
export const TargetAgentSchema = z.enum(['claude_code', 'cursor', 'generic']);
export type TargetAgent = z.infer<typeof TargetAgentSchema>;

/**
 * AI output for a wrapped prompt: only the framing portions. The feature spec body is inserted
 * verbatim by the deterministic assembler (assembleAgentPrompt), so the AI surface is small. Each
 * field is markdown — paragraphs and bullets are fine, no top-level "#"/"##" headings (the assembler
 * supplies them). agent_specific_notes is permitted to be empty (e.g. for the generic target).
 */
export const AgentPromptModelOutputSchema = z.object({
  role_intro: z.string().min(50).max(3000),
  how_to_work: z.string().min(50).max(3000),
  philosophy: z.string().min(50).max(2000),
  agent_specific_notes: z.string().min(0).max(2000),
});
export type AgentPromptModelOutput = z.infer<typeof AgentPromptModelOutputSchema>;

/** Edge Function input: which chunk to generate a prompt for, and which target agent to wrap for. */
export const GenerateAgentPromptInputSchema = z.object({
  chunkId: z.string().uuid(),
  targetAgent: TargetAgentSchema,
});
export type GenerateAgentPromptInput = z.infer<typeof GenerateAgentPromptInputSchema>;
