import { CheckCircle2 } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChunkBoard } from '@/features/projects/chunks/board/ChunkBoard';
import { ChunksError } from '@/features/projects/chunks/ChunksError';
import { ChunksGatingState } from '@/features/projects/chunks/ChunksGatingState';
import { ChunksPending } from '@/features/projects/chunks/ChunksPending';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { useGenerateChunks } from '@/features/projects/chunks/useGenerateChunks';
import { useProject } from '@/features/projects/layout/useProject';
import { useContextFilesState } from '@/features/projects/overview/stubs/useContextFilesState';
import { useDocumentTitle } from '@/lib/document-title';

export function ChunksPage() {
  // The layout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  useDocumentTitle(`Chunks — ${project.name || 'Project'} — buildmap`);
  const contextFiles = useContextFilesState(projectId);
  const chunksQuery = useChunks(projectId);
  const generate = useGenerateChunks(projectId);
  const generateChunks = generate.mutate;
  const startedForProjectRef = useRef<string | null>(null);

  const chunks = chunksQuery.data ?? [];
  const chunksExist = chunks.length > 0;
  const contextFilesExist = contextFiles.data.exists;

  useEffect(() => {
    // Wait for both lookups; a failed read must not trigger generation.
    if (contextFiles.isPending || chunksQuery.isPending || chunksQuery.isError) {
      return;
    }
    // Chunks already exist (return visit): display them, never auto-regenerate.
    if (chunksExist) {
      return;
    }
    // Context files gate generation; the gating state handles this case.
    if (!contextFilesExist) {
      return;
    }
    // Track which project generation fired for: blocks StrictMode replay and still fires for a
    // different project opened in the same component instance.
    if (startedForProjectRef.current === projectId) {
      return;
    }

    startedForProjectRef.current = projectId;
    generateChunks();
  }, [
    contextFiles.isPending,
    chunksQuery.isPending,
    chunksQuery.isError,
    chunksExist,
    contextFilesExist,
    generateChunks,
    projectId,
  ]);

  // First-time generation advances project status; surface the transition once, when chunks exist.
  const showStatusAdvanced = generate.data?.statusAdvanced === true && chunksExist;

  let body: ReactNode;

  if (chunksQuery.isPending) {
    body = <ChunksPending />;
  } else if (chunksExist) {
    body = <ChunkBoard chunks={chunks} projectId={projectId} />;
  } else if (chunksQuery.isError) {
    body = <ChunksError error={chunksQuery.error} onRetry={() => void chunksQuery.refetch()} />;
  } else if (contextFiles.isPending) {
    body = <ChunksPending />;
  } else if (!contextFilesExist) {
    body = <ChunksGatingState projectId={projectId} />;
  } else if (generate.isError) {
    body = <ChunksError error={generate.error} onRetry={() => generateChunks()} />;
  } else {
    // Context files exist, no chunks yet: generation is idle or in flight.
    body = <ChunksPending />;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight">{CHUNKS_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{CHUNKS_MESSAGES.PAGE_SUBTITLE}</p>
      </header>
      {showStatusAdvanced && (
        <Alert className="mb-6">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          <AlertTitle>{CHUNKS_MESSAGES.STATUS_ADVANCED_TITLE}</AlertTitle>
          <AlertDescription>{CHUNKS_MESSAGES.STATUS_ADVANCED_BODY}</AlertDescription>
        </Alert>
      )}
      {body}
    </div>
  );
}
