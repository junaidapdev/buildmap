import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { getAiErrorCopy } from '@/features/_shared/ai-error-copy';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';
import { useGenerateContextFiles } from '@/features/projects/context-files/useGenerateContextFiles';

type ContextFilesPageActionsProps = {
  projectId: string;
  approvedCount: number;
  total: number;
};

export function ContextFilesPageActions({
  projectId,
  approvedCount,
  total,
}: ContextFilesPageActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const generate = useGenerateContextFiles(projectId);

  function handleRegenerateAll(): void {
    setConfirmOpen(false);
    generate.mutate();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {CONTEXT_FILES_MESSAGES.APPROVAL_PROGRESS(approvedCount, total)}
        </span>
        <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
          <AlertDialogTrigger asChild>
            <Button aria-busy={generate.isPending} disabled={generate.isPending} variant="outline">
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              {generate.isPending
                ? CONTEXT_FILES_MESSAGES.REGENERATE_ALL_BUSY
                : CONTEXT_FILES_MESSAGES.REGENERATE_ALL_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_CONFIRM_TITLE}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_CONFIRM_CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleRegenerateAll}>
                {CONTEXT_FILES_MESSAGES.REGENERATE_ALL_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      {generate.isError && (
        <p className="text-right text-sm text-destructive">
          {getAiErrorCopy(generate.error, CONTEXT_FILES_MESSAGES.ERROR_BODY)}
        </p>
      )}
    </div>
  );
}
