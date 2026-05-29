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
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import { useGenerateChunks } from '@/features/projects/chunks/useGenerateChunks';

type ChunksPageActionsProps = {
  projectId: string;
};

export function ChunksPageActions({ projectId }: ChunksPageActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const generate = useGenerateChunks(projectId);

  function handleRegenerateAll(): void {
    setConfirmOpen(false);
    generate.mutate();
  }

  return (
    <div className="space-y-2">
      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogTrigger asChild>
          <Button aria-busy={generate.isPending} disabled={generate.isPending} variant="outline">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {generate.isPending
              ? CHUNKS_MESSAGES.REGENERATE_ALL_BUSY
              : CHUNKS_MESSAGES.REGENERATE_ALL_BUTTON}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{CHUNKS_MESSAGES.REGENERATE_ALL_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {CHUNKS_MESSAGES.REGENERATE_ALL_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{CHUNKS_MESSAGES.REGENERATE_ALL_CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerateAll}>
              {CHUNKS_MESSAGES.REGENERATE_ALL_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {generate.isError && (
        <p className="text-right text-sm text-destructive">{CHUNKS_MESSAGES.ERROR_BODY}</p>
      )}
    </div>
  );
}
