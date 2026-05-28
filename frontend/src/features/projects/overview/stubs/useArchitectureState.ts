// Stub for the not-yet-built architecture feature. Swapping this body for a real query later
// activates the architecture milestone without changing the overview page.
// TODO(chunk-15): replace with a real query for the project's architecture document.
// Future query key: ['overview', 'architecture', projectId].
export type ArchitectureState = { exists: boolean; approved: boolean };

export function useArchitectureState(_projectId: string): { data: ArchitectureState } {
  return { data: { exists: false, approved: false } };
}
