import type { TargetAgent } from '@shared/schemas/agent-prompt';
import type { ContextFileType } from '@shared/schemas/context-files';
import { slugForFilename } from '@/lib/download';

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
