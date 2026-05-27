// Stub for the not-yet-built chunks feature. The overview's recommendation engine and chunks panel
// read chunk progress here; swapping this body for a real query later activates both without
// changing the overview page.
// TODO(chunk-18 / 19 / 22): replace with a real query for the project's feature chunks.
// Future query key: ['overview', 'chunks', projectId].
export type ChunksState = {
  exists: boolean;
  hasInProgress: boolean;
  hasIncomplete: boolean;
  allDone: boolean;
  total: number;
  completed: number;
  inProgress: number;
  open: number;
};

export function useChunksState(_projectId: string): { data: ChunksState } {
  return {
    data: {
      exists: false,
      hasInProgress: false,
      hasIncomplete: false,
      allDone: false,
      total: 0,
      completed: 0,
      inProgress: 0,
      open: 0,
    },
  };
}
