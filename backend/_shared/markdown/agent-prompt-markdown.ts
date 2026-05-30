import type { AgentPromptModelOutput, TargetAgent } from '@shared/schemas/agent-prompt.ts';
import type { FeatureSpecContent } from '@shared/schemas/feature-spec.ts';

/** Display names for the three target agents — used in the prompt's meta line. */
const TARGET_AGENT_LABELS: Record<TargetAgent, string> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  generic: 'Generic AI agent',
};

type AssembleAgentPromptInput = {
  ai: AgentPromptModelOutput;
  spec: FeatureSpecContent;
  chunkTitle: string;
  chunkRef: string;
  projectName: string;
  targetAgent: TargetAgent;
};

/**
 * Deterministically render the final agent-ready prompt markdown from the AI's framing fields and
 * the feature spec content. The spec content is inserted verbatim (the AI does not regenerate it),
 * which keeps the AI surface small and the prompt's spec body consistent across regenerations.
 * Pure function — no side effects, identical input always produces identical output.
 */
export function assembleAgentPrompt(input: AssembleAgentPromptInput): string {
  const { ai, spec, chunkTitle, chunkRef, projectName, targetAgent } = input;
  const lines: string[] = [`# ${chunkTitle} — Implementation Prompt`, ''];

  lines.push(
    `*Project: ${projectName} · Target agent: ${
      TARGET_AGENT_LABELS[targetAgent]
    } · Chunk ref: \`${chunkRef}\`*`,
    '',
  );

  lines.push('## Your role', ai.role_intro, '');
  lines.push('## How to work', ai.how_to_work, '');
  lines.push('## Project philosophy', ai.philosophy, '');

  if (ai.agent_specific_notes.trim().length > 0) {
    lines.push('## Notes for this agent', ai.agent_specific_notes, '');
  }

  lines.push('## Goal', spec.goal, '');
  lines.push('## Scope', spec.scope, '');
  lines.push('## Out of Scope', spec.out_of_scope, '');
  lines.push('## Technical Requirements', spec.technical_requirements, '');
  lines.push('## UI Requirements', spec.ui_requirements, '');
  lines.push('## Security Requirements', spec.security_requirements, '');
  lines.push('## Acceptance Criteria', spec.acceptance_criteria, '');

  lines.push('---', '');
  lines.push(
    'When you have completed this chunk, summarize: files changed, any architectural decisions made, any known issues, and what should happen next. Then update the progress tracker.',
  );

  return lines.join('\n');
}
