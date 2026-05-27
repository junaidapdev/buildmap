export type ProjectStatus =
  | 'idea'
  | 'planning'
  | 'ready_to_build'
  | 'building'
  | 'paused'
  | 'completed';

export type Project = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  project_type: 'side_project' | 'company' | 'client' | 'saas' | 'other' | null;
  preferred_stack: string | null;
  preferred_agent: 'claude_code' | 'cursor' | 'codex' | 'windsurf' | 'other' | null;
  created_at: string;
  updated_at: string;
};
