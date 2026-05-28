// Reads the project's PRD existence/approval for the overview recommendation engine. This replaced
// the Chunk 12 stub once the PRD feature (Chunk 13) landed; the `{ data }` shape is unchanged so the
// recommendation engine keeps working, with `isPending` added to avoid a recommendation flicker.
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';

export type PrdState = { exists: boolean; approved: boolean };

export function usePrdState(projectId: string): { data: PrdState; isPending: boolean } {
  const query = useExistingPrd(projectId);

  return {
    data: {
      exists: Boolean(query.data),
      approved: query.data?.is_final === true,
    },
    isPending: query.isPending,
  };
}
