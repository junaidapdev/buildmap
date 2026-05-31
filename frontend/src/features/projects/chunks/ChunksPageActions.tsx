import { KanbanSquare, List, RefreshCw } from 'lucide-react';
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
import type { ChunksView } from '@/features/projects/chunks/ChunksPage';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import { useGenerateChunks } from '@/features/projects/chunks/useGenerateChunks';
import { cn } from '@/lib/utils';

type ChunksPageActionsProps = {
  projectId: string;
  view: ChunksView;
  onViewChange: (view: ChunksView) => void;
};

/**
 * Header-rhythm toolbar for the Chunks page. Two clusters:
 *
 *  - View toggle: segmented Board/List control rendered as two buttons inside a single rounded
 *    border. The active button gets the elevated card surface so the inactive feels like a tab.
 *  - Re-slice: existing regenerate-all flow, renamed to match the Lumen mockup. Same AlertDialog
 *    confirm body warning that all chunks + specs are replaced.
 *
 * "Add chunk" is intentionally not shipped here — there's no single-chunk insert procedure today
 * (only `replace_project_chunks`). Adding it needs a backend change; flagged as a follow-up in the
 * redesign PR.
 */
export function ChunksPageActions({ projectId, view, onViewChange }: ChunksPageActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const generate = useGenerateChunks(projectId);

  function handleRegenerateAll(): void {
    setConfirmOpen(false);
    generate.mutate();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div
          aria-label={CHUNKS_MESSAGES.VIEW_TOGGLE_LABEL}
          className="inline-flex items-center rounded-md border border-border bg-card p-0.5"
          role="group"
        >
          <button
            aria-pressed={view === 'board'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[12px] font-medium transition-colors',
              view === 'board'
                ? 'bg-subtle text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => onViewChange('board')}
            type="button"
          >
            <KanbanSquare aria-hidden="true" className="h-3.5 w-3.5" />
            {CHUNKS_MESSAGES.VIEW_BOARD}
          </button>
          <button
            aria-pressed={view === 'list'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[12px] font-medium transition-colors',
              view === 'list'
                ? 'bg-subtle text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => onViewChange('list')}
            type="button"
          >
            <List aria-hidden="true" className="h-3.5 w-3.5" />
            {CHUNKS_MESSAGES.VIEW_LIST}
          </button>
        </div>

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
                ? CHUNKS_MESSAGES.REGENERATE_ALL_BUSY
                : CHUNKS_MESSAGES.RESLICE_BUTTON}
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
      </div>
      {generate.isError && (
        <p className="text-right text-sm text-destructive">
          {getAiErrorCopy(generate.error, CHUNKS_MESSAGES.ERROR_BODY)}
        </p>
      )}
    </div>
  );
}
