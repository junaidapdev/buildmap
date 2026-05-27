import type { ProjectCreateInput } from '@shared/schemas/project';

export const PROJECT_TYPE_LABELS: Record<
  NonNullable<ProjectCreateInput['project_type']>,
  string
> = {
  side_project: 'Side project',
  company: 'Company project',
  client: 'Client work',
  saas: 'SaaS / product',
  other: 'Other',
};

export const PROJECT_AGENT_LABELS: Record<
  NonNullable<ProjectCreateInput['preferred_agent']>,
  string
> = {
  claude_code: 'Claude Code',
  cursor: 'Cursor',
  codex: 'Codex',
  windsurf: 'Windsurf',
  other: 'Other',
};
