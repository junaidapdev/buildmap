import { Copy, Download, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';
import { formatRelativeTime } from '@/lib/relative-time';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { useDownloadMarkdown } from '@/hooks/useDownloadMarkdown';
import { FILENAMES } from '@shared/export/filenames';

type IssuePromptDisplayProps = {
  issueId: string;
  issueTitle: string;
  content: string;
  version: number;
  updatedAt: string;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

export function IssuePromptDisplay({
  issueId,
  issueTitle,
  content,
  version,
  updatedAt,
  onRegenerate,
  isRegenerating,
}: IssuePromptDisplayProps) {
  const clipboard = useCopyToClipboard();
  const downloadMarkdown = useDownloadMarkdown();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const canDownload = content.trim().length > 0;

  function copyLabel(): string {
    switch (clipboard.state) {
      case 'busy':
        return ISSUE_MESSAGES.COPY_BUTTON_BUSY;
      case 'done':
        return ISSUE_MESSAGES.COPY_BUTTON_DONE;
      case 'error':
        return ISSUE_MESSAGES.COPY_BUTTON_ERROR;
      default:
        return ISSUE_MESSAGES.COPY_BUTTON;
    }
  }

  function handleConfirm(): void {
    setConfirmOpen(false);
    onRegenerate();
  }

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{ISSUE_MESSAGES.VERSION_LABEL(version)}</Badge>
          <span className="text-xs text-muted-foreground">
            {ISSUE_MESSAGES.LAST_UPDATED_PREFIX}{' '}
            {formatRelativeTime(updatedAt, ISSUE_MESSAGES.UPDATED_JUST_NOW)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            aria-busy={clipboard.state === 'busy'}
            disabled={clipboard.state === 'busy' || isRegenerating}
            onClick={() => clipboard.copy(content)}
            variant="outline"
          >
            <Copy aria-hidden="true" className="h-4 w-4" />
            {copyLabel()}
          </Button>
          <Button
            disabled={!canDownload || isRegenerating}
            onClick={() =>
              downloadMarkdown({ filename: FILENAMES.issue(issueTitle, issueId), content })
            }
            variant="outline"
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            {ISSUE_MESSAGES.DOWNLOAD_BUTTON}
          </Button>
          <Button
            aria-busy={isRegenerating}
            disabled={isRegenerating || clipboard.state === 'busy'}
            onClick={() => setConfirmOpen(true)}
            variant="outline"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {isRegenerating ? ISSUE_MESSAGES.PROMPT_BUSY : ISSUE_MESSAGES.REGENERATE_PROMPT_BUTTON}
          </Button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ISSUE_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {ISSUE_MESSAGES.REGENERATE_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{ISSUE_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {ISSUE_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
