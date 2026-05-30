import { useState } from 'react';

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
  const [retryUsed, setRetryUsed] = useState(false);

  function retryGeneration(): void {
    setRetryUsed(true);
    void generation.refetch();
  }

  // "Working" covers waiting on the session (query disabled), the initial fetch, and an in-flight
  // retry — so retrying shows the pending state instead of leaving the error card on screen.
  const isWorking = generation.isPending || generation.isFetching;

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{CLARIFY_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{CLARIFY_MESSAGES.PAGE_SUBTITLE}</p>
      </header>
      {isWorking && <ClarifyPending />}
      {!isWorking && generation.isError && (
        <ClarifyError
          canRetry={!retryUsed}
          error={generation.error}
          onRetry={retryGeneration}
          projectId={projectId}
        />
      )}
      {!isWorking && generation.isSuccess && (
        <ClarifyForm projectId={projectId} questions={generation.data} />
      )}
    </div>
  );
}
