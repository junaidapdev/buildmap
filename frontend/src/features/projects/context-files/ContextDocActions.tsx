import { Check, Copy, Pencil, RefreshCw, X } from 'lucide-react';
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
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { cn } from '@/lib/utils';

type ContextDocActionsProps = {
  type: ContextFileType;
  content: string;
  onEdit: () => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

/**
 * Compact icon-button cluster shown in the doc card header. Copy, Edit, Regenerate — all 32x32
 * ghost buttons with sr-only labels. Copy uses the shared useCopyToClipboard hook so the icon
 * flips to a checkmark for 2s after a successful copy (or an X on failure).
 *
 * Approve and Download moved out: Approve is a stand-alone primary button below the card body
 * (it's a stateful action that deserves prominence when unapproved), and Download is folded into
 * the page-level "Download all" toolbar action above.
 */
export function ContextDocActions({
  type: _type,
  content,
  onEdit,
  onRegenerate,
  isRegenerating,
}: ContextDocActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { state: copyState, copy } = useCopyToClipboard();
  const busy = isRegenerating;
  const canCopy = content.trim().length > 0;

  function handleRegenerate(): void {
    setConfirmOpen(false);
    onRegenerate();
  }

  const copyLabel =
    copyState === 'done'
      ? CONTEXT_FILES_MESSAGES.COPY_DONE
      : copyState === 'error'
        ? CONTEXT_FILES_MESSAGES.COPY_ERROR
        : copyState === 'busy'
          ? CONTEXT_FILES_MESSAGES.COPY_BUSY
          : CONTEXT_FILES_MESSAGES.COPY_BUTTON;

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <Button
        aria-label={copyLabel}
        className={cn(
          'h-8 w-8 text-muted-foreground hover:text-foreground',
          copyState === 'done' && 'text-brand-text hover:text-brand-text',
          copyState === 'error' && 'text-destructive hover:text-destructive',
        )}
        disabled={!canCopy || copyState === 'busy'}
        onClick={() => void copy(content)}
        size="icon"
        variant="ghost"
      >
        {copyState === 'done' ? (
          <Check aria-hidden="true" className="h-4 w-4" />
        ) : copyState === 'error' ? (
          <X aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Copy aria-hidden="true" className="h-4 w-4" />
        )}
      </Button>
      <Button
        aria-label={CONTEXT_FILES_MESSAGES.EDIT_BUTTON}
        className="h-8 w-8 text-muted-foreground hover:text-foreground"
        disabled={busy}
        onClick={onEdit}
        size="icon"
        variant="ghost"
      >
        <Pencil aria-hidden="true" className="h-4 w-4" />
      </Button>
      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogTrigger asChild>
          <Button
            aria-busy={isRegenerating}
            aria-label={
              isRegenerating
                ? CONTEXT_FILES_MESSAGES.REGENERATE_BUSY
                : CONTEXT_FILES_MESSAGES.REGENERATE_BUTTON
            }
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={busy}
            size="icon"
            variant="ghost"
          >
            <RefreshCw
              aria-hidden="true"
              className={cn('h-4 w-4', isRegenerating && 'animate-spin')}
            />
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
    </div>
  );
}
