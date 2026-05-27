import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { CLARIFY_MESSAGES } from '@/features/projects/clarify/messages';

type ClarifyErrorProps = {
  canRetry: boolean;
  onRetry: () => void;
  projectId: string;
};

export function ClarifyError({ canRetry, onRetry, projectId }: ClarifyErrorProps) {
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
