import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';

type IssuesErrorProps = {
  onRetry: () => void;
};

export function IssuesError({ onRetry }: IssuesErrorProps) {
  return (
    <section className="flex flex-col items-center py-16 text-center" role="alert">
      <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertCircle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold">{ISSUE_MESSAGES.ERROR_TITLE}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{ISSUE_MESSAGES.ERROR_BODY}</p>
      <div className="mt-6">
        <Button onClick={onRetry}>{ISSUE_MESSAGES.ERROR_RETRY}</Button>
      </div>
    </section>
  );
}
