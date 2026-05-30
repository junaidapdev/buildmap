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
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';
import type { LearningRow } from '@/features/projects/knowledge/useLearnings';
import { useUpdateLearning } from '@/features/projects/knowledge/useUpdateLearning';

type LearningEditDialogProps = {
  projectId: string;
  learning: LearningRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Inline edit dialog for a single learning. Mirrors the AddNotesDialog field-level validation
 * pattern. Type is intentionally not editable — the AI picked it from the four enum values and
 * letting users freely re-type would muddy the section groupings.
 *
 * The parent (LearningCard) only mounts this dialog while `open` is true, so the initial useState
 * values re-seed naturally on each open. We deliberately avoid the setState-in-useEffect pattern.
 */
export function LearningEditDialog({
  projectId,
  learning,
  open,
  onOpenChange,
}: LearningEditDialogProps) {
  const [title, setTitle] = useState(learning.title);
  const [content, setContent] = useState(learning.content);
  const update = useUpdateLearning(projectId, learning.id);

  const trimmedTitle = title.trim();
  const trimmedContent = content.trim();
  const titleTooShort = trimmedTitle.length > 0 && trimmedTitle.length < 3;
  const titleTooLong = trimmedTitle.length > 200;
  const contentTooShort = trimmedContent.length > 0 && trimmedContent.length < 10;
  const contentTooLong = trimmedContent.length > 2000;
  const allRequired = trimmedTitle.length >= 3 && trimmedContent.length >= 10 && !titleTooLong &&
    !contentTooLong;
  const dirty = trimmedTitle !== learning.title.trim() || trimmedContent !== learning.content.trim();
  const canSubmit = allRequired && dirty && !update.isPending;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    try {
      await update.mutateAsync({
        title: trimmedTitle !== learning.title.trim() ? trimmedTitle : undefined,
        content: trimmedContent !== learning.content.trim() ? trimmedContent : undefined,
      });
      onOpenChange(false);
    } catch {
      // update.isError surfaces the inline failure copy below.
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{KNOWLEDGE_MESSAGES.EDIT_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{KNOWLEDGE_MESSAGES.EDIT_DIALOG_BODY}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="learning-edit-title">
              {KNOWLEDGE_MESSAGES.FIELD_TITLE_LABEL}
            </label>
            <Input
              autoFocus
              id="learning-edit-title"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
            {titleTooShort && (
              <p className="text-xs text-destructive">{KNOWLEDGE_MESSAGES.FIELD_TITLE_TOO_SHORT}</p>
            )}
            {titleTooLong && (
              <p className="text-xs text-destructive">{KNOWLEDGE_MESSAGES.FIELD_TITLE_TOO_LONG}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="learning-edit-content">
              {KNOWLEDGE_MESSAGES.FIELD_LEARNING_CONTENT_LABEL}
            </label>
            <Textarea
              id="learning-edit-content"
              onChange={(event) => setContent(event.target.value)}
              rows={6}
              value={content}
            />
            {contentTooShort && (
              <p className="text-xs text-destructive">
                {KNOWLEDGE_MESSAGES.FIELD_LEARNING_CONTENT_TOO_SHORT}
              </p>
            )}
            {contentTooLong && (
              <p className="text-xs text-destructive">
                {KNOWLEDGE_MESSAGES.FIELD_LEARNING_CONTENT_TOO_LONG}
              </p>
            )}
          </div>

          {update.isError && (
            <p className="text-sm text-destructive">{KNOWLEDGE_MESSAGES.EDIT_FAILED}</p>
          )}

          <DialogFooter>
            <Button
              disabled={update.isPending}
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              {KNOWLEDGE_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button aria-busy={update.isPending} disabled={!canSubmit} type="submit">
              {update.isPending
                ? KNOWLEDGE_MESSAGES.EDIT_SAVE_BUTTON_BUSY
                : KNOWLEDGE_MESSAGES.EDIT_SAVE_BUTTON}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
