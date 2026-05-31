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
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { EXPORT_MESSAGES } from '@/features/projects/export/messages';
import { useExportProjectZip } from '@/features/projects/export/useExportProjectZip';
import { Download } from '@/features/projects/overview/icons';
import { PanelCard } from '@/features/projects/overview/PanelCard';

type Props = {
  projectId: string;
  projectName: string;
};

/**
 * Project ZIP export — re-skinned to use PanelCard chrome so it sits in the overview grid with the
 * same uppercase mono eyebrow + subtle border + content rhythm as Brief / Open issues / Decisions /
 * Learnings. Previously used shadcn's default Card / CardHeader / CardTitle which gave it a
 * noticeably different visual weight (larger sentence-case title, different padding).
 */
export function ExportProjectCard({ projectId, projectName }: Props) {
  const exportMutation = useExportProjectZip();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const errorMessage = exportMutation.isError
    ? exportMutation.error?.message === 'EXPORT_TOO_LARGE'
      ? EXPORT_MESSAGES.ERROR_TOO_LARGE
      : EXPORT_MESSAGES.ERROR_GENERIC
    : null;

  return (
    <PanelCard
      icon={<Download aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={EXPORT_MESSAGES.CARD_TITLE}
    >
      <div className="space-y-3">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {EXPORT_MESSAGES.CARD_BODY}
        </p>
        <Button
          className="w-full sm:w-auto"
          disabled={exportMutation.isPending}
          onClick={() => setConfirmOpen(true)}
          size="sm"
        >
          <Download aria-hidden="true" className="h-3.5 w-3.5" />
          {exportMutation.isPending
            ? EXPORT_MESSAGES.CARD_BUTTON_BUSY
            : EXPORT_MESSAGES.CARD_BUTTON}
        </Button>
        {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      </div>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{EXPORT_MESSAGES.CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{EXPORT_MESSAGES.CONFIRM_BODY}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{EXPORT_MESSAGES.CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                exportMutation.mutate({ projectId, projectName });
              }}
            >
              {EXPORT_MESSAGES.CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PanelCard>
  );
}
