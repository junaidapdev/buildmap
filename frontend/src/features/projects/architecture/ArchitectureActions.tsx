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
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';
import { useDownloadMarkdown } from '@/hooks/useDownloadMarkdown';
import { FILENAMES } from '@/lib/filenames';

type ArchitectureActionsProps = {
  projectId: string;
  content: string;
  isFinal: boolean;
  onApprove: () => void;
  isApproving: boolean;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

export function ArchitectureActions({
  projectId,
  content,
  isFinal,
  onApprove,
  isApproving,
  onRegenerate,
  isRegenerating,
}: ArchitectureActionsProps) {
  const downloadMarkdown = useDownloadMarkdown();
  const canDownload = content.trim().length > 0;

  return (
    <div className="space-y-4 border-t pt-6">
      {isFinal && (
        <Alert className="border-green-600/40 text-green-700 dark:border-green-500/40 dark:text-green-500 [&>svg]:text-green-600 dark:[&>svg]:text-green-500">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          <AlertTitle>{ARCHITECTURE_MESSAGES.APPROVED_BANNER}</AlertTitle>
          <AlertDescription>
            <Link
              className="font-medium underline underline-offset-4"
              to={ROUTES.PROJECT_CONTEXT(projectId)}
            >
              {ARCHITECTURE_MESSAGES.NEXT_CTA}
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {!isFinal && (
          <Button
            aria-busy={isApproving}
            disabled={isApproving || isRegenerating}
            onClick={onApprove}
          >
            {isApproving
              ? ARCHITECTURE_MESSAGES.APPROVE_BUTTON_BUSY
              : ARCHITECTURE_MESSAGES.APPROVE_BUTTON}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              aria-busy={isRegenerating}
              disabled={isRegenerating || isApproving}
              variant="outline"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              {isRegenerating
                ? ARCHITECTURE_MESSAGES.REGENERATE_BUSY
                : ARCHITECTURE_MESSAGES.REGENERATE_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
              <AlertDialogDescription>
                {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_CANCEL}
              </AlertDialogCancel>
              <AlertDialogAction onClick={onRegenerate}>
                {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          disabled={!canDownload}
          onClick={() => downloadMarkdown({ filename: FILENAMES.architecture(), content })}
          variant="outline"
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          {ARCHITECTURE_MESSAGES.DOWNLOAD_BUTTON}
        </Button>
      </div>
    </div>
  );
}
