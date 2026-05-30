import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IssueSeveritySchema, type IssueSeverity } from '@shared/schemas/issue';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';
import { useCreateIssue } from '@/features/projects/issues/useCreateIssue';

type NewIssueDialogProps = {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const NO_CHUNK_VALUE = '__none__';

/**
 * The new-issue form. Validates required fields inline (matching the Chunk 14/20 field-level
 * pattern), creates the issue via create_issue, then auto-fires generate-issue-prompt and navigates
 * to the detail page. Auto-firing keeps the spec's "user pastes a bug and receives a prompt fast"
 * promise — the detail page renders the pending state immediately so the user knows the AI is
 * working.
 */
export function NewIssueDialog({ projectId, open, onOpenChange }: NewIssueDialogProps) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<IssueSeverity>('medium');
  const [chunkId, setChunkId] = useState<string>(NO_CHUNK_VALUE);

  const chunksQuery = useChunks(projectId);
  const create = useCreateIssue(projectId);
  // Pre-bind the prompt generator to an empty issueId; we re-create at submit-time with the new id.
  // (useGenerateIssuePrompt closes over issueId, so we can't reuse one instance across issues.)
  const chunks = chunksQuery.data ?? [];

  const titleTooShort = title.trim().length > 0 && title.trim().length < 3;
  const titleTooLong = title.trim().length > 200;
  const descTooShort = description.trim().length > 0 && description.trim().length < 20;
  const descTooLong = description.trim().length > 8000;
  const allRequired = title.trim().length >= 3 && description.trim().length >= 20 && !titleTooLong &&
    !descTooLong;
  const canSubmit = allRequired && !create.isPending;

  function reset(): void {
    setTitle('');
    setDescription('');
    setSeverity('medium');
    setChunkId(NO_CHUNK_VALUE);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!canSubmit) {
      return;
    }
    const selectedChunkId = chunkId === NO_CHUNK_VALUE ? null : chunkId;
    try {
      const newIssueId = await create.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        severity,
        chunkId: selectedChunkId,
      });
      // Auto-fire generation on the new issue id, but don't await — the detail page renders the
      // pending state from its own useGenerateIssuePrompt mutation, and an awaited call here would
      // delay the navigation for no UX benefit.
      reset();
      onOpenChange(false);
      navigate(ROUTES.PROJECT_ISSUE(projectId, newIssueId), {
        state: { autoGenerate: true },
      });
    } catch {
      // create.isError surfaces the inline failure copy below.
    }
  }

  function handleOpenChange(next: boolean): void {
    if (!next) {
      reset();
    }
    onOpenChange(next);
  }

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ISSUE_MESSAGES.NEW_ISSUE_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{ISSUE_MESSAGES.NEW_ISSUE_DIALOG_BODY}</DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="new-issue-title">
              {ISSUE_MESSAGES.FIELD_TITLE_LABEL}
            </label>
            <Input
              autoFocus
              id="new-issue-title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder={ISSUE_MESSAGES.FIELD_TITLE_PLACEHOLDER}
              value={title}
            />
            {titleTooShort && (
              <p className="text-xs text-destructive">{ISSUE_MESSAGES.FIELD_TITLE_TOO_SHORT}</p>
            )}
            {titleTooLong && (
              <p className="text-xs text-destructive">{ISSUE_MESSAGES.FIELD_TITLE_TOO_LONG}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="new-issue-description">
              {ISSUE_MESSAGES.FIELD_DESCRIPTION_LABEL}
            </label>
            <Textarea
              id="new-issue-description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder={ISSUE_MESSAGES.FIELD_DESCRIPTION_PLACEHOLDER}
              rows={6}
              value={description}
            />
            {descTooShort && (
              <p className="text-xs text-destructive">
                {ISSUE_MESSAGES.FIELD_DESCRIPTION_TOO_SHORT}
              </p>
            )}
            {descTooLong && (
              <p className="text-xs text-destructive">
                {ISSUE_MESSAGES.FIELD_DESCRIPTION_TOO_LONG}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="new-issue-severity">
                {ISSUE_MESSAGES.FIELD_SEVERITY_LABEL}
              </label>
              <Select onValueChange={(value) => setSeverity(value as IssueSeverity)} value={severity}>
                <SelectTrigger id="new-issue-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {IssueSeveritySchema.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {ISSUE_MESSAGES.SEVERITY_LABELS[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="new-issue-chunk">
                {ISSUE_MESSAGES.FIELD_RELATED_CHUNK_LABEL}
              </label>
              <Select onValueChange={setChunkId} value={chunkId}>
                <SelectTrigger id="new-issue-chunk">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CHUNK_VALUE}>
                    {ISSUE_MESSAGES.FIELD_RELATED_CHUNK_NONE}
                  </SelectItem>
                  {chunks.map((chunk) => (
                    <SelectItem key={chunk.id} value={chunk.id}>
                      {chunk.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {create.isError && (
            <p className="text-sm text-destructive">{ISSUE_MESSAGES.CREATE_FAILED}</p>
          )}

          <DialogFooter>
            <Button
              disabled={create.isPending}
              onClick={() => handleOpenChange(false)}
              type="button"
              variant="outline"
            >
              {ISSUE_MESSAGES.CANCEL_BUTTON}
            </Button>
            <Button aria-busy={create.isPending} disabled={!canSubmit} type="submit">
              {create.isPending
                ? ISSUE_MESSAGES.CREATE_BUTTON_BUSY
                : ISSUE_MESSAGES.CREATE_BUTTON}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

