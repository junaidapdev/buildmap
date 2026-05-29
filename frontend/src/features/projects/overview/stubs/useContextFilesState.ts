// Reads the project's context-files existence/approval for the overview recommendation engine. This
// replaced the Chunk 17 stub once the context-files feature landed; the `{ data }` shape stays
// compatible with the recommendation engine, with `isPending` added to avoid a recommendation
// flicker and approval fields added so chunks gate on all seven being approved.
import { CONTEXT_DOC_TOTAL } from '@/features/projects/context-files/doc-config';
import { useAllContextFiles } from '@/features/projects/context-files/useAllContextFiles';

export type ContextFilesOverviewState = {
  exists: boolean;
  approvedCount: number;
  total: number;
  allApproved: boolean;
};

export function useContextFilesState(
  projectId: string,
): { data: ContextFilesOverviewState; isPending: boolean } {
  const query = useAllContextFiles(projectId);

  return {
    data: {
      exists: query.data?.exists ?? false,
      approvedCount: query.data?.approvedCount ?? 0,
      total: query.data?.total ?? CONTEXT_DOC_TOTAL,
      allApproved: query.data?.allApproved ?? false,
    },
    isPending: query.isPending,
  };
}
