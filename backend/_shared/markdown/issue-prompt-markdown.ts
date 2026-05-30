import type { IssuePromptModelOutput, IssueSeverity } from '@shared/schemas/issue.ts';

type AssembleIssuePromptInput = {
  ai: IssuePromptModelOutput;
  projectName: string;
  issueTitle: string;
  issueDescription: string;
  severity: IssueSeverity;
  /** Optional — included in the meta line only when the issue is linked to a chunk. */
  linkedChunkTitle?: string;
};

/**
 * Deterministically assemble the issue's corrective prompt from the AI's framing and the user's
 * original report. Pure — same input always produces identical output. Used by the
 * generate-issue-prompt Edge Function to render the markdown body persisted on
 * project_issues.corrective_prompt.
 */
export function assembleIssuePrompt(input: AssembleIssuePromptInput): string {
  const { ai, projectName, issueTitle, issueDescription, severity, linkedChunkTitle } = input;
  const lines: string[] = [`# Issue: ${issueTitle}`, ''];

  const chunkSegment = linkedChunkTitle ? ` · Related chunk: ${linkedChunkTitle}` : '';
  lines.push(`*Project: ${projectName} · Severity: ${severity}${chunkSegment}*`, '');

  lines.push('## Your role', ai.role_intro, '');
  lines.push('## Original report', issueDescription, '');
  lines.push('## What to fix', ai.what_to_fix, '');
  lines.push('## Acceptance', ai.acceptance, '');

  lines.push('---', '');
  lines.push(
    'When complete, summarize: files changed, root cause, regression checks added. Then mark the issue resolved.',
  );

  return lines.join('\n');
}
