import type { ProjectCreateInput } from '@shared/schemas/project';
import type { UserPreferredAgent } from '@shared/schemas/user-profile';

/**
 * Maps user-level default (agent prompt targets) to project create preferred_agent.
 * Projects use a wider enum; "generic" maps to "other".
 */
export function mapPreferredAgentForNewProject(
  agent: UserPreferredAgent | null | undefined,
): ProjectCreateInput['preferred_agent'] | undefined {
  if (!agent) {
    return undefined;
  }
  if (agent === 'generic') {
    return 'other';
  }
  if (agent === 'claude_code' || agent === 'cursor') {
    return agent;
  }
  return undefined;
}
