// Stub for the not-yet-built decision log (surfaced via the architecture page in MVP). The recent-
// decisions panel reads here; swapping this body for a real query later activates the panel without
// changing the overview page.
// TODO(chunk-16): replace with a real query for the project's logged decisions.
// Future query key: ['overview', 'decisions', projectId].
export type DecisionSummary = { id: string; title: string; createdAt: string };
export type DecisionsState = { recent: DecisionSummary[] };

export function useDecisionsState(_projectId: string): { data: DecisionsState } {
  return { data: { recent: [] } };
}
