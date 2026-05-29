import { useEffect, useRef, type ReactNode } from 'react';

import { ContextFilesError } from '@/features/projects/context-files/ContextFilesError';
import { ContextFilesGatingState } from '@/features/projects/context-files/ContextFilesGatingState';
import { ContextFilesPending } from '@/features/projects/context-files/ContextFilesPending';
import { ContextFilesView } from '@/features/projects/context-files/ContextFilesView';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';
import { useAllContextFiles } from '@/features/projects/context-files/useAllContextFiles';
import { useGenerateContextFiles } from '@/features/projects/context-files/useGenerateContextFiles';
import { useExistingArchitecture } from '@/features/projects/architecture/useExistingArchitecture';
import { useProject } from '@/features/projects/layout/useProject';

export function ContextFilesPage() {
  // The layout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  const architecture = useExistingArchitecture(projectId);
  const contextFiles = useAllContextFiles(projectId);
  const generate = useGenerateContextFiles(projectId);
  const generateContextFiles = generate.mutate;
  const startedForProjectRef = useRef<string | null>(null);

  const architectureApproved = architecture.data?.is_final === true;

  useEffect(() => {
    // Wait for both lookups; a failed read must not trigger generation.
    if (architecture.isPending || contextFiles.isPending) {
      return;
    }
    if (architecture.isError || contextFiles.isError) {
      return;
    }
    // The full set already exists (return visit): display it, never auto-regenerate.
    if (contextFiles.data?.exists) {
      return;
    }
    // The architecture gates generation; the gating state handles this case.
    if (!architectureApproved) {
      return;
    }
    // Track which project generation fired for: blocks StrictMode replay and still fires for a
    // different project opened in the same component instance.
    if (startedForProjectRef.current === projectId) {
      return;
    }

    startedForProjectRef.current = projectId;
    generateContextFiles();
  }, [
    architecture.isPending,
    architecture.isError,
    contextFiles.isPending,
    contextFiles.isError,
    contextFiles.data?.exists,
    architectureApproved,
    generateContextFiles,
    projectId,
  ]);

  let body: ReactNode;

  if (contextFiles.isPending) {
    body = <ContextFilesPending />;
  } else if (contextFiles.data?.exists) {
    // An existing set renders regardless of architecture state; architecture only gates generation.
    body = <ContextFilesView projectId={projectId} state={contextFiles.data} />;
  } else if (contextFiles.isError) {
    body = <ContextFilesError onRetry={() => void contextFiles.refetch()} />;
  } else if (architecture.isPending) {
    body = <ContextFilesPending />;
  } else if (architecture.isError) {
    body = <ContextFilesError onRetry={() => void architecture.refetch()} />;
  } else if (!architectureApproved) {
    body = <ContextFilesGatingState projectId={projectId} />;
  } else if (generate.isError) {
    body = <ContextFilesError onRetry={() => generateContextFiles()} />;
  } else {
    // Architecture approved, no context files yet: generation is idle or in flight.
    body = <ContextFilesPending />;
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{CONTEXT_FILES_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{CONTEXT_FILES_MESSAGES.PAGE_SUBTITLE}</p>
      </header>
      {body}
    </div>
  );
}
