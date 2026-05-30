import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';

type ProgressErrorProps = {
  onRetry: () => void;
};

export function ProgressError({ onRetry }: ProgressErrorProps) {
  return (
    <section className="flex flex-col items-center py-16 text-center" role="alert">
      <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
        <AlertCircle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold">{PROGRESS_MESSAGES.ERROR_TITLE}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">{PROGRESS_MESSAGES.ERROR_BODY}</p>
      <div className="mt-6">
        <Button onClick={onRetry}>{PROGRESS_MESSAGES.ERROR_RETRY}</Button>
      </div>
    </section>
  );
}
