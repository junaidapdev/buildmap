import { CheckCircle2, RefreshCw } from 'lucide-react';
import { useRef, useState } from 'react';

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
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';
import { useSyncProgressToMarkdown } from '@/features/projects/progress/useSyncProgressToMarkdown';
import type { Project } from '@/types/project';

type SyncToMarkdownButtonProps = {
  projectId: string;
  project: Pick<Project, 'name' | 'status'>;
  chunks: ChunkRow[];
};

const SUCCESS_BANNER_MS = 4000;

/**
 * Button + confirmation dialog wrapping useSyncProgressToMarkdown. The user is warned that manual
 * markdown edits on the Progress Tracker context file will be overwritten before the mutation runs.
 * Success is surfaced via a transient banner below the button (no toast system in the app yet).
 */
export function SyncToMarkdownButton({ projectId, project, chunks }: SyncToMarkdownButtonProps) {
  const sync = useSyncProgressToMarkdown(projectId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  // Hold the active dismiss timer so a fast re-sync replaces the previous one cleanly.
  const successTimerRef = useRef<number | null>(null);

  function handleConfirm(): void {
    setConfirmOpen(false);
    // Stamp the timestamp here so the renderer stays pure (no Date.now inside the helper).
    sync.mutate(
      { project, chunks, generatedAt: new Date().toISOString() },
      {
        onSuccess: () => {
          if (successTimerRef.current !== null) {
            window.clearTimeout(successTimerRef.current);
          }
          setShowSuccess(true);
          successTimerRef.current = window.setTimeout(() => {
            setShowSuccess(false);
            successTimerRef.current = null;
          }, SUCCESS_BANNER_MS);
        },
      },
    );
  }

  function buttonLabel(): string {
    if (sync.isPending) {
      return PROGRESS_MESSAGES.SYNC_BUTTON_BUSY;
    }
    return PROGRESS_MESSAGES.SYNC_BUTTON;
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogTrigger asChild>
          <Button aria-busy={sync.isPending} disabled={sync.isPending} variant="outline">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {buttonLabel()}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{PROGRESS_MESSAGES.SYNC_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {PROGRESS_MESSAGES.SYNC_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{PROGRESS_MESSAGES.SYNC_CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {PROGRESS_MESSAGES.SYNC_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showSuccess && (
        <p
          aria-live="polite"
          className="flex items-center gap-1 text-xs text-green-700 dark:text-green-500"
          role="status"
        >
          <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5" />
          {PROGRESS_MESSAGES.SYNC_SUCCESS}
        </p>
      )}

      {sync.isError && (
        <p className="text-xs text-destructive" role="alert">
          {PROGRESS_MESSAGES.SYNC_FAILED}
        </p>
      )}
    </div>
  );
}
