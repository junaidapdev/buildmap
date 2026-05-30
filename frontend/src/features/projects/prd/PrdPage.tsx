import { useEffect, useRef, type ReactNode } from 'react';

import { useExistingBrief } from '@/features/projects/brief/useExistingBrief';
import { useProject } from '@/features/projects/layout/useProject';
import { PRD_MESSAGES } from '@/features/projects/prd/messages';
import { PrdError } from '@/features/projects/prd/PrdError';
import { PrdGatingState } from '@/features/projects/prd/PrdGatingState';
import { PrdPending } from '@/features/projects/prd/PrdPending';
import { PrdView } from '@/features/projects/prd/PrdView';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';
import { useGeneratePrd } from '@/features/projects/prd/useGeneratePrd';

export function PrdPage() {
  // The layout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  const brief = useExistingBrief(projectId);
  const prd = useExistingPrd(projectId);
  const generate = useGeneratePrd(projectId);
  const generatePrd = generate.mutate;
  const startedForProjectRef = useRef<string | null>(null);

  const briefApproved = brief.data?.is_final === true;

  useEffect(() => {
    // Wait for both lookups; a failed read must not trigger generation.
    if (brief.isPending || prd.isPending) {
      return;
    }
    if (brief.isError || prd.isError) {
      return;
    }
    // A PRD already exists (return visit): display it, never auto-regenerate.
    if (prd.data) {
      return;
    }
    // The brief gates PRD generation; the gating state handles this case.
    if (!briefApproved) {
      return;
    }
    // Track which project generation fired for: blocks StrictMode replay and still fires for a
    // different project opened in the same component instance.
    if (startedForProjectRef.current === projectId) {
      return;
    }

    startedForProjectRef.current = projectId;
    generatePrd();
  }, [
    brief.isPending,
    brief.isError,
    prd.isPending,
    prd.isError,
    prd.data,
    briefApproved,
    generatePrd,
    projectId,
  ]);

  let body: ReactNode;

  if (prd.isPending) {
    body = <PrdPending />;
  } else if (prd.data) {
    // An existing PRD renders regardless of brief state; the brief only gates generation.
    body = <PrdView prd={prd.data} projectId={projectId} />;
  } else if (prd.isError) {
    body = <PrdError error={prd.error} onRetry={() => void prd.refetch()} />;
  } else if (brief.isPending) {
    body = <PrdPending />;
  } else if (brief.isError) {
    body = <PrdError error={brief.error} onRetry={() => void brief.refetch()} />;
  } else if (!briefApproved) {
    body = <PrdGatingState projectId={projectId} />;
  } else if (generate.isError) {
    body = <PrdError error={generate.error} onRetry={() => generatePrd()} />;
  } else {
    // Brief approved, no PRD yet: generation is idle or in flight.
    body = <PrdPending />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{PRD_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{PRD_MESSAGES.PAGE_SUBTITLE}</p>
      </header>
      {body}
    </div>
  );
}
