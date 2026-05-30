import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { AiErrorState } from '@/features/_shared/AiErrorState';
import { CLARIFY_MESSAGES } from '@/features/projects/clarify/messages';
import { EdgeFunctionError } from '@/lib/edge';
import { RATE_LIMIT_ERROR_CODE } from '@/lib/rate-limit';

type ClarifyErrorProps = {
  canRetry: boolean;
  error: unknown;
  onRetry: () => void;
  projectId: string;
};

export function ClarifyError({ canRetry, error, onRetry, projectId }: ClarifyErrorProps) {
  if (error instanceof EdgeFunctionError && error.code === RATE_LIMIT_ERROR_CODE) {
    return (
      <AiErrorState
        error={error}
        fallbackBody={CLARIFY_MESSAGES.ERROR_BODY}
        fallbackTitle={CLARIFY_MESSAGES.ERROR_TITLE}
        onRetry={onRetry}
        retryLabel={CLARIFY_MESSAGES.ERROR_RETRY}
      />
    );
  }

  return (
    <section className="flex flex-col items-center py-16 text-center" role="alert">
      <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertCircle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold">{CLARIFY_MESSAGES.ERROR_TITLE}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{CLARIFY_MESSAGES.ERROR_BODY}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {canRetry && <Button onClick={onRetry}>{CLARIFY_MESSAGES.ERROR_RETRY}</Button>}
        <Button asChild variant={canRetry ? 'outline' : 'default'}>
          <Link state={{ clarificationAnswers: [] }} to={ROUTES.PROJECT_BRIEF(projectId)}>
            {CLARIFY_MESSAGES.ERROR_SKIP}
          </Link>
        </Button>
      </div>
    </section>
  );
}
