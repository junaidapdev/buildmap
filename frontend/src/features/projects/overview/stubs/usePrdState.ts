// Stub for the not-yet-built PRD feature. The overview reads PRD existence/approval through this
// hook so that activating the PRD only means swapping this body for a real query — the overview
// page and recommendation engine do not change.
// TODO(chunk-13): replace with a real query for the project's PRD document.
// Future query key: ['overview', 'prd', projectId].
export type PrdState = { exists: boolean; approved: boolean };

export function usePrdState(_projectId: string): { data: PrdState } {
  return { data: { exists: false, approved: false } };
}
