import type { TargetAgent } from '@shared/schemas/agent-prompt.ts';
import type { ContextFileType } from '@shared/schemas/context-files.ts';

/** Slug a string for use in filenames. Lowercase; non-alphanumerics -> `-`; collapse runs. */
export function slugForFilename(input: string, maxLength = 60): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength)
    .replace(/^-+|-+$/g, '');

  return slug || 'untitled';
}

export const FILENAMES = {
  brief: () => 'brief.md',
  prd: () => 'prd.md',
  architecture: () => 'architecture.md',
  project_overview: () => 'project-overview.md',
  code_standards: () => 'code-standards.md',
  ai_workflow_rules: () => 'ai-workflow-rules.md',
  ui_context: () => 'ui-context.md',
  agents_md: () => 'AGENTS.md',
  claude_md: () => 'CLAUDE.md',
  progress_tracker: () => 'progress-tracker.md',
  contextDoc: (type: ContextFileType) => FILENAMES[type](),
  featureSpec: (ref: string | null, title: string) =>
    `feature-spec-${ref ?? slugForFilename(title)}.md`,
  agentPrompt: (ref: string | null, title: string, target: TargetAgent) =>
    `prompt-${ref ?? slugForFilename(title)}-${target.replace('_', '-')}.md`,
  issue: (title: string, id: string) => `issue-${slugForFilename(title)}-${id.slice(0, 8)}.md`,
} as const;

/** ZIP folder path for a chunk. Position is zero-padded to 2 digits (MVP cap: 99 chunks). */
export function chunkFolderPath(position: number, ref: string | null, title: string): string {
  const padded = String(position + 1).padStart(2, '0');
  const slug = ref ?? slugForFilename(title);
  return `chunks/${padded}-${slug}`;
}

/** Filename for a single prompt within the chunk folder. */
export function chunkPromptFilename(target: 'claude_code' | 'cursor' | 'generic'): string {
  return `prompt-${target.replace('_', '-')}.md`;
}

/** Path inside the ZIP for each context file type. */
export const CONTEXT_ZIP_PATHS: Record<string, string> = {
  project_overview: 'context/01-project-overview.md',
  code_standards: 'context/02-code-standards.md',
  ai_workflow_rules: 'context/03-ai-workflow-rules.md',
  ui_context: 'context/04-ui-context.md',
  progress_tracker: 'context/06-progress-tracker.md',
};

/** Filename for an issue inside the ZIP. */
export function issueZipFilename(id: string, title: string): string {
  return `issues/${id.slice(0, 8)}-${slugForFilename(title)}.md`;
}

/** Filename for each learnings file (by type). */
export const LEARNINGS_FILENAMES: Record<
  'lesson' | 'decision' | 'gotcha' | 'open_question',
  string
> = {
  lesson: 'learnings/lessons.md',
  decision: 'learnings/decisions.md',
  gotcha: 'learnings/gotchas.md',
  open_question: 'learnings/open-questions.md',
};

/** Slug project name for the outer ZIP filename; never empty. */
export function slugForFilenameSafe(name: string): string {
  const s = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
  return s || 'project';
}
