import { CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { BRIEF_MESSAGES } from '@/features/projects/brief/messages';
import { useDownloadMarkdown } from '@/hooks/useDownloadMarkdown';
import { FILENAMES } from '@shared/export/filenames';

type BriefActionsProps = {
  projectId: string;
  content: string;
  isFinal: boolean;
  onApprove: () => void;
  isApproving: boolean;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

export function BriefActions({
  projectId,
  content,
  isFinal,
  onApprove,
  isApproving,
  onRegenerate,
  isRegenerating,
}: BriefActionsProps) {
  const downloadMarkdown = useDownloadMarkdown();
  const canDownload = content.trim().length > 0;

  return (
    <div className="space-y-4 border-t pt-6">
      {isFinal && (
        <Alert className="border-green-600/40 text-green-700 dark:border-green-500/40 dark:text-green-500 [&>svg]:text-green-600 dark:[&>svg]:text-green-500">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          <AlertTitle>{BRIEF_MESSAGES.APPROVED_BANNER}</AlertTitle>
          <AlertDescription>
            <Link
              className="font-medium underline underline-offset-4"
              to={ROUTES.PROJECT_PRD(projectId)}
            >
              {BRIEF_MESSAGES.NEXT_CTA}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {!isFinal && (
          <Button aria-busy={isApproving} disabled={isApproving} onClick={onApprove}>
            {isApproving ? BRIEF_MESSAGES.APPROVE_BUTTON_BUSY : BRIEF_MESSAGES.APPROVE_BUTTON}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button aria-busy={isRegenerating} disabled={isRegenerating} variant="outline">
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              {isRegenerating ? BRIEF_MESSAGES.REGENERATE_BUSY : BRIEF_MESSAGES.REGENERATE_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{BRIEF_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
              <AlertDialogDescription>
                {BRIEF_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{BRIEF_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
              <AlertDialogAction onClick={onRegenerate}>
                {BRIEF_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          disabled={!canDownload}
          onClick={() => downloadMarkdown({ filename: FILENAMES.brief(), content })}
          variant="outline"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          {BRIEF_MESSAGES.DOWNLOAD_BUTTON}
        </Button>
      </div>

      <p className="text-right text-xs text-muted-foreground">{BRIEF_MESSAGES.REGENERATE_HINT}</p>
    </div>
  );
}
