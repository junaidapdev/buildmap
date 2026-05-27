import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { ClarifyError } from '@/features/projects/clarify/ClarifyError';
import { ClarifyForm } from '@/features/projects/clarify/ClarifyForm';
import { CLARIFY_MESSAGES } from '@/features/projects/clarify/messages';
import { ClarifyPending } from '@/features/projects/clarify/ClarifyPending';
import { useClarifyingQuestions } from '@/features/projects/clarify/useClarifyingQuestions';

export function ClarifyPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = id ?? '';
  const generation = useClarifyingQuestions(projectId);
  const generateQuestions = generation.mutate;
  const initialGenerationStarted = useRef(false);
  const [retryUsed, setRetryUsed] = useState(false);

  useEffect(() => {
    if (!id || initialGenerationStarted.current) {
      return;
    }

    // The ref prevents React development effect replay from issuing a duplicate AI request.
    initialGenerationStarted.current = true;
    generateQuestions();
  }, [generateQuestions, id]);

  if (!id) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

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
