// Reads the project's architectural decisions for the overview's recent-decisions panel. In the MVP
// decisions live inside the architecture document (content_json.decisions), so this replaced the
// Chunk 12 stub once the architecture feature (Chunk 15) landed; the `{ data }` shape is unchanged so
// the panel keeps working. Chunk 16 adds the dedicated decision-log management UI.
import type { ArchitectureDecisionStatus } from '@shared/schemas/architecture';
import { useExistingArchitecture } from '@/features/projects/architecture/useExistingArchitecture';

export type DecisionSummary = { id: string; title: string; status: ArchitectureDecisionStatus };
export type DecisionsState = { recent: DecisionSummary[] };

export function useDecisionsState(projectId: string): { data: DecisionsState } {
  const query = useExistingArchitecture(projectId);
  const decisions = query.data?.content_json.decisions ?? [];

  // The most recent 3. Decisions have no timestamps in the MVP, so "recent" is the tail of the
  // ordered array the generator produced.
  const recent = decisions
    .slice(-3)
    .reverse()
    .map((decision) => ({ id: decision.id, title: decision.title, status: decision.status }));

  return { data: { recent } };
}
