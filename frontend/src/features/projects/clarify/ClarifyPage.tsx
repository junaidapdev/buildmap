import { useEffect, useRef, useState } from 'react';

import { ClarifyError } from '@/features/projects/clarify/ClarifyError';
import { ClarifyForm } from '@/features/projects/clarify/ClarifyForm';
import { CLARIFY_MESSAGES } from '@/features/projects/clarify/messages';
import { ClarifyPending } from '@/features/projects/clarify/ClarifyPending';
import { useClarifyingQuestions } from '@/features/projects/clarify/useClarifyingQuestions';
import { useProject } from '@/features/projects/layout/useProject';

export function ClarifyPage() {
  // The layout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  const generation = useClarifyingQuestions(projectId);
  const generateQuestions = generation.mutate;
  const initialGenerationStarted = useRef(false);
  const [retryUsed, setRetryUsed] = useState(false);

  useEffect(() => {
    if (initialGenerationStarted.current) {
      return;
    }

    // The ref prevents React development effect replay from issuing a duplicate AI request.
    initialGenerationStarted.current = true;
    generateQuestions();
  }, [generateQuestions]);

  function retryGeneration(): void {
    setRetryUsed(true);
    generateQuestions();
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{CLARIFY_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{CLARIFY_MESSAGES.PAGE_SUBTITLE}</p>
      </header>
      {(generation.isIdle || generation.isPending) && <ClarifyPending />}
      {generation.isError && (
        <ClarifyError canRetry={!retryUsed} onRetry={retryGeneration} projectId={projectId} />
      )}
      {generation.isSuccess && <ClarifyForm projectId={projectId} questions={generation.data} />}
    </div>
  );
}
