// Reads the project's architecture existence/approval for the overview recommendation engine. This
// replaced the Chunk 12 stub once the architecture feature (Chunk 15) landed; the `{ data }` shape is
// unchanged so the recommendation engine keeps working, with `isPending` added to avoid a
// recommendation flicker.
import { useExistingArchitecture } from '@/features/projects/architecture/useExistingArchitecture';

export type ArchitectureState = { exists: boolean; approved: boolean };

export function useArchitectureState(
  projectId: string,
): { data: ArchitectureState; isPending: boolean } {
  const query = useExistingArchitecture(projectId);

  return {
    data: {
      exists: Boolean(query.data),
      approved: query.data?.is_final === true,
    },
    isPending: query.isPending,
  };
}
