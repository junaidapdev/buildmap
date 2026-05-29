import type { ContextFileType } from '@shared/schemas/context-files';
import {
  useAllContextFiles,
  type ContextFileRow,
} from '@/features/projects/context-files/useAllContextFiles';

export type ContextFileResult = {
  doc: ContextFileRow | null;
  isPending: boolean;
  isError: boolean;
};

/**
 * Selects a single context doc from the shared `useAllContextFiles` query. Because both hooks key on
 * the same query, every doc panel reads from one cached fetch rather than issuing its own request.
 */
export function useContextFile(projectId: string, type: ContextFileType): ContextFileResult {
  const query = useAllContextFiles(projectId);

  return {
    doc: query.data?.byType[type] ?? null,
    isPending: query.isPending,
    isError: query.isError,
  };
}
