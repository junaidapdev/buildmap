import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getAiErrorCopy } from '@/features/_shared/ai-error-copy';
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';
import { useExtractLearnings } from '@/features/projects/knowledge/useExtractLearnings';

type AddNotesDialogProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (count: number) => void;
};

/**
 * Paste-input form. Validates required fields inline (matching the Chunk 14/20/23 field-level
 * pattern). On submit, fires extract-learnings; on success closes the dialog and bubbles the count
 * up so the page can render an inline result banner (no toast library — same precedent as Chunk 22).
 */
export function AddNotesDialog({ projectId, open, onOpenChange, onSuccess }: AddNotesDialogProps) {
  const [sourceLabel, setSourceLabel] = useState('');
  const [content, setContent] = useState('');
  const extract = useExtractLearnings(projectId);

  const trimmedContent = content.trim();
  const trimmedLabel = sourceLabel.trim();
  const labelTooLong = trimmedLabel.length > 200;
  const contentTooShort = trimmedContent.length > 0 && trimmedContent.length < 20;
  const contentTooLong = trimmedContent.length > 50000;
  const allRequired = trimmedContent.length >= 20 && !contentTooLong && !labelTooLong;
  const canSubmit = allRequired && !extract.isPending;

  function reset(): void {
    setSourceLabel('');
    setContent('');
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    try {
      const result = await extract.mutateAsync({
        sourceLabel: trimmedLabel.length > 0 ? trimmedLabel : undefined,
        sourceContent: content,
      });
      reset();
      onOpenChange(false);
      onSuccess?.(result.count);
    } catch {
      // extract.isError surfaces the inline failure copy below.
    }
  }

  function handleOpenChange(next: boolean): void {
    if (!next && !extract.isPending) {
      reset();
    }
    onOpenChange(next);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{KNOWLEDGE_MESSAGES.ADD_NOTES_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{KNOWLEDGE_MESSAGES.ADD_NOTES_DIALOG_BODY}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="add-notes-source">
              {KNOWLEDGE_MESSAGES.FIELD_SOURCE_LABEL}
            </label>
            <Input
              id="add-notes-source"
              onChange={(event) => setSourceLabel(event.target.value)}
              placeholder={KNOWLEDGE_MESSAGES.FIELD_SOURCE_PLACEHOLDER}
              value={sourceLabel}
            />
            {labelTooLong && (
              <p className="text-xs text-destructive">{KNOWLEDGE_MESSAGES.FIELD_SOURCE_TOO_LONG}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="add-notes-content">
              {KNOWLEDGE_MESSAGES.FIELD_CONTENT_LABEL}
            </label>
            <Textarea
              autoFocus
              id="add-notes-content"
              onChange={(event) => setContent(event.target.value)}
              placeholder={KNOWLEDGE_MESSAGES.FIELD_CONTENT_PLACEHOLDER}
              rows={12}
              value={content}
            />
            {contentTooShort && (
              <p className="text-xs text-destructive">
                {KNOWLEDGE_MESSAGES.FIELD_CONTENT_TOO_SHORT}
              </p>
            )}
            {contentTooLong && (
              <p className="text-xs text-destructive">
                {KNOWLEDGE_MESSAGES.FIELD_CONTENT_TOO_LONG}
              </p>
            )}
          </div>

          {extract.isPending && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-medium">{KNOWLEDGE_MESSAGES.EXTRACT_PENDING_TITLE}</p>
              <p className="text-muted-foreground">{KNOWLEDGE_MESSAGES.EXTRACT_PENDING_BODY}</p>
            </div>
          )}

          {extract.isError && (
            <p className="text-sm text-destructive">
              {getAiErrorCopy(extract.error, KNOWLEDGE_MESSAGES.EXTRACT_FAILED)}
            </p>
          )}

          <DialogFooter>
            <Button
              disabled={extract.isPending}
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              {KNOWLEDGE_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button aria-busy={extract.isPending} disabled={!canSubmit} type="submit">
              {extract.isPending
                ? KNOWLEDGE_MESSAGES.EXTRACT_BUTTON_BUSY
                : KNOWLEDGE_MESSAGES.EXTRACT_BUTTON}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
