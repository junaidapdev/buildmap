// Stub for the not-yet-built context-files feature. Swapping this body for a real query later
// activates the context-files milestone without changing the overview page.
// TODO(chunk-17): replace with a real query for the project's generated context files.
// Future query key: ['overview', 'context-files', projectId].
export type ContextFilesState = { exists: boolean };

export function useContextFilesState(_projectId: string): { data: ContextFilesState } {
  return { data: { exists: false } };
}
