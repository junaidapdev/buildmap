import type { ContextFileType } from '@shared/schemas/context-files';

/**
 * Display metadata for each of the seven canonical context files, in the order they appear as tabs.
 * `filename` is the canonical on-disk name the generated docs cross-reference (and the eventual
 * export pack uses); it is shown under each tab so users recognise the artifact.
 */
export type ContextDocMeta = {
  type: ContextFileType;
  label: string;
  filename: string;
  description: string;
};

export const CONTEXT_DOC_ORDER = [
  {
    type: 'project_overview',
    label: 'Project Overview',
    filename: 'project-overview.md',
    description: 'The one-pager an AI tool reads first: what this project is and how it is built.',
  },
  {
    type: 'code_standards',
    label: 'Code Standards',
    filename: 'code-standards.md',
    description: 'Concrete, project-specific conventions the generated code must follow.',
  },
  {
    type: 'ai_workflow_rules',
    label: 'AI Workflow Rules',
    filename: 'ai-workflow-rules.md',
    description: 'How an AI agent should work in this repo: planning, edits, and guardrails.',
  },
  {
    type: 'ui_context',
    label: 'UI Context',
    filename: 'ui-context.md',
    description: 'Design language, components, and UX patterns for the interface.',
  },
  {
    type: 'agents_md',
    label: 'AGENTS.md',
    filename: 'AGENTS.md',
    description: 'The root instructions file most coding agents read automatically.',
  },
  {
    type: 'claude_md',
    label: 'CLAUDE.md',
    filename: 'CLAUDE.md',
    description: 'The root instructions file Claude Code reads automatically.',
  },
  {
    type: 'progress_tracker',
    label: 'Progress Tracker',
    filename: 'progress-tracker.md',
    description: 'The living checklist the agent updates as work ships.',
  },
] as const satisfies readonly ContextDocMeta[];

/** The canonical count of context files. Derived so it can never drift from the ordered list. */
export const CONTEXT_DOC_TOTAL = CONTEXT_DOC_ORDER.length;
