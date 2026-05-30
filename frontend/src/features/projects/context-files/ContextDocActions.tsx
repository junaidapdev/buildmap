import { CheckCircle2, Download, Pencil, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import type { ContextFileType } from '@shared/schemas/context-files';
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
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';
import { useDownloadMarkdown } from '@/hooks/useDownloadMarkdown';
import { FILENAMES } from '@shared/export/filenames';

type ContextDocActionsProps = {
  type: ContextFileType;
  content: string;
  isFinal: boolean;
  onEdit: () => void;
  onApprove: () => void;
  isApproving: boolean;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

export function ContextDocActions({
  type,
  content,
  isFinal,
  onEdit,
  onApprove,
  isApproving,
  onRegenerate,
  isRegenerating,
}: ContextDocActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const downloadMarkdown = useDownloadMarkdown();
  const busy = isApproving || isRegenerating;
  const canDownload = content.trim().length > 0;

  function handleRegenerate(): void {
    setConfirmOpen(false);
    onRegenerate();
  }

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-end">
      <Button disabled={busy} onClick={onEdit} size="sm" variant="ghost">
        <Pencil aria-hidden="true" className="h-4 w-4" />
        {CONTEXT_FILES_MESSAGES.EDIT_BUTTON}
      </Button>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogTrigger asChild>
          <Button aria-busy={isRegenerating} disabled={busy} size="sm" variant="outline">
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {isRegenerating
              ? CONTEXT_FILES_MESSAGES.REGENERATE_BUSY
              : CONTEXT_FILES_MESSAGES.REGENERATE_BUTTON}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{CONTEXT_FILES_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {CONTEXT_FILES_MESSAGES.REGENERATE_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {CONTEXT_FILES_MESSAGES.REGENERATE_CONFIRM_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRegenerate}>
              {CONTEXT_FILES_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        disabled={!canDownload}
        onClick={() => downloadMarkdown({ filename: FILENAMES.contextDoc(type), content })}
        size="sm"
        variant="outline"
      >
        <Download aria-hidden="true" className="h-4 w-4" />
        {CONTEXT_FILES_MESSAGES.DOWNLOAD_BUTTON}
      </Button>

      {!isFinal && (
        <Button aria-busy={isApproving} disabled={busy} onClick={onApprove} size="sm">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          {isApproving
            ? CONTEXT_FILES_MESSAGES.APPROVE_BUSY
            : CONTEXT_FILES_MESSAGES.APPROVE_BUTTON}
        </Button>
      )}
    </div>
  );
}
