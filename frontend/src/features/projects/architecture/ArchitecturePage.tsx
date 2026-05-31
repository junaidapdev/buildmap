import { useEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

import { useProject } from '@/features/projects/layout/useProject';
import { ArchitectureError } from '@/features/projects/architecture/ArchitectureError';
import { ArchitectureGatingState } from '@/features/projects/architecture/ArchitectureGatingState';
import { ArchitecturePending } from '@/features/projects/architecture/ArchitecturePending';
import { ArchitectureView } from '@/features/projects/architecture/ArchitectureView';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';
import { useExistingArchitecture } from '@/features/projects/architecture/useExistingArchitecture';
import { useGenerateArchitecture } from '@/features/projects/architecture/useGenerateArchitecture';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';
import { useDocumentTitle } from '@/lib/document-title';

export function ArchitecturePage() {
  // The layout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  useDocumentTitle(`Architecture — ${project.name || 'Project'} — buildmap`);
  const location = useLocation();
  const prd = useExistingPrd(projectId);
  const architecture = useExistingArchitecture(projectId);
  const generate = useGenerateArchitecture(projectId);
  const generateArchitecture = generate.mutate;
  const startedForProjectRef = useRef<string | null>(null);

  // The overview's "View architecture" link deep-links to the decision log via #decisions. Scroll to
  // it once the architecture (and thus the anchored section) has rendered.
  useEffect(() => {
    if (location.hash !== '#decisions' || !architecture.data) {
      return;
    }
    document.getElementById('decisions')?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash, architecture.data]);

  const prdApproved = prd.data?.is_final === true;

  useEffect(() => {
    // Wait for both lookups; a failed read must not trigger generation.
    if (prd.isPending || architecture.isPending) {
      return;
    }
    if (prd.isError || architecture.isError) {
      return;
    }
    // An architecture already exists (return visit): display it, never auto-regenerate.
    if (architecture.data) {
      return;
    }
    // The PRD gates architecture generation; the gating state handles this case.
    if (!prdApproved) {
      return;
    }
    // Track which project generation fired for: blocks StrictMode replay and still fires for a
    // different project opened in the same component instance.
    if (startedForProjectRef.current === projectId) {
      return;
    }

    startedForProjectRef.current = projectId;
    generateArchitecture();
  }, [
    prd.isPending,
    prd.isError,
    architecture.isPending,
    architecture.isError,
    architecture.data,
    prdApproved,
    generateArchitecture,
    projectId,
  ]);

  let body: ReactNode;

  if (architecture.isPending) {
    body = <ArchitecturePending />;
  } else if (architecture.data) {
    // An existing architecture renders regardless of PRD state; the PRD only gates generation.
    body = <ArchitectureView arch={architecture.data} projectId={projectId} />;
  } else if (architecture.isError) {
    body = (
      <ArchitectureError error={architecture.error} onRetry={() => void architecture.refetch()} />
    );
  } else if (prd.isPending) {
    body = <ArchitecturePending />;
  } else if (prd.isError) {
    body = <ArchitectureError error={prd.error} onRetry={() => void prd.refetch()} />;
  } else if (!prdApproved) {
    body = <ArchitectureGatingState projectId={projectId} />;
  } else if (generate.isError) {
    body = <ArchitectureError error={generate.error} onRetry={() => generateArchitecture()} />;
  } else {
    // PRD approved, no architecture yet: generation is idle or in flight.
    body = <ArchitecturePending />;
  }

  return (
    // max-w-7xl matches Brief / PRD / Overview so all four planning surfaces share one viewport
    // rhythm. The subtitle keeps its own max-w-2xl so the helper prose stays comfortable to
    // read; the section cards inherit the wider page width and stretch naturally.
    <div className="mx-auto max-w-7xl">
      <header className="mb-8 border-b border-border-subtle pb-7">
        <p className="page-eyebrow">{ARCHITECTURE_MESSAGES.PAGE_EYEBROW}</p>
        <h1 className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-tight">
          {ARCHITECTURE_MESSAGES.PAGE_TITLE}
        </h1>
        <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
          {ARCHITECTURE_MESSAGES.PAGE_SUBTITLE}
        </p>
      </header>
      {body}
    </div>
  );
}
