import { Download, RefreshCw } from 'lucide-react';
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
import { CONTEXT_DOC_ORDER } from '@/features/projects/context-files/doc-config';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';
import type { ContextFilesState } from '@/features/projects/context-files/useAllContextFiles';
import { useGenerateContextFiles } from '@/features/projects/context-files/useGenerateContextFiles';
import { useDownloadMarkdown } from '@/hooks/useDownloadMarkdown';
import { FILENAMES } from '@shared/export/filenames';

type ContextFilesPageActionsProps = {
  projectId: string;
  state: ContextFilesState;
};

/**
 * Doc-suite toolbar that sits below the page header. Left side carries the X-of-7 approval-count
 * pill so doc-suite status is visible at a glance. Right side fires the two doc-suite-level
 * actions: Download all (sequential per-file downloads, no new dep) and Regenerate all (alert
 * dialog confirm, then full re-generation).
 *
 * Download all fires the seven file downloads with a ~200ms gap so browsers don't pop-up-block
 * them. A real ZIP bundle would need either a new client dep (jszip) or a backend endpoint —
 * scoping note in the redesign PR.
 */
export function ContextFilesPageActions({ projectId, state }: ContextFilesPageActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const generate = useGenerateContextFiles(projectId);
  const downloadMarkdown = useDownloadMarkdown();

  function handleRegenerateAll(): void {
    setConfirmOpen(false);
    generate.mutate();
  }

  async function handleDownloadAll(): Promise<void> {
    if (downloading) return;
    setDownloading(true);
    for (const meta of CONTEXT_DOC_ORDER) {
      const doc = state.byType[meta.type];
      if (!doc || doc.content.trim().length === 0) continue;
      downloadMarkdown({
        filename: FILENAMES.contextDoc(meta.type),
        content: doc.content,
      });
      // Tiny delay between downloads so Chrome/Safari don't bundle them into a single prompt.
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    setDownloading(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-md border border-border-subtle bg-subtle/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          {CONTEXT_FILES_MESSAGES.APPROVAL_PROGRESS(state.approvedCount, state.total)}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            aria-busy={downloading}
            disabled={downloading}
            onClick={() => void handleDownloadAll()}
            size="sm"
            variant="outline"
          >
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            {downloading
              ? CONTEXT_FILES_MESSAGES.DOWNLOAD_ALL_BUSY
              : CONTEXT_FILES_MESSAGES.DOWNLOAD_ALL_BUTTON}
          </Button>
          <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
            <AlertDialogTrigger asChild>
              <Button
                aria-busy={generate.isPending}
                disabled={generate.isPending}
                size="sm"
                variant="outline"
              >
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
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
      </div>
      {generate.isError && (
        <p className="text-right text-sm text-destructive">
          {getAiErrorCopy(generate.error, CONTEXT_FILES_MESSAGES.ERROR_BODY)}
        </p>
      )}
    </div>
  );
}
