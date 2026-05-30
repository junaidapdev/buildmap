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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';
import { LearningEditDialog } from '@/features/projects/knowledge/LearningEditDialog';
import type { LearningRow } from '@/features/projects/knowledge/useLearnings';
import { useDeleteLearning } from '@/features/projects/knowledge/useDeleteLearning';

type LearningCardProps = {
  projectId: string;
  learning: LearningRow;
};

/**
 * One learning row's display + actions. Renders the title and content with React's JSX escaping
 * (no markdown render) so any HTML in the AI's output is shown as text. The optional source_label
 * and source_raw provenance live under a button-toggled section — no Collapsible primitive needed.
 */
export function LearningCard({ projectId, learning }: LearningCardProps) {
  const [showSource, setShowSource] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const remove = useDeleteLearning(projectId, learning.id);

  async function handleDelete(): Promise<void> {
    try {
      await remove.mutateAsync();
      setConfirmDeleteOpen(false);
    } catch {
      // remove.isError surfaces the inline failure copy below; keep the dialog open so the user
      // can retry or cancel.
    }
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <Badge variant="outline">
              {KNOWLEDGE_MESSAGES.TYPE_BADGE_LABELS[learning.type]}
            </Badge>
            <h3 className="font-semibold">{learning.title}</h3>
            <p className="text-sm text-muted-foreground">{learning.content}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button onClick={() => setEditOpen(true)} size="sm" variant="ghost">
              {KNOWLEDGE_MESSAGES.EDIT_BUTTON}
            </Button>
            <Button
              onClick={() => setConfirmDeleteOpen(true)}
              size="sm"
              variant="ghost"
            >
              {KNOWLEDGE_MESSAGES.DELETE_BUTTON}
            </Button>
          </div>
        </div>

        {learning.source_label && (
          <p className="text-xs text-muted-foreground">
            {KNOWLEDGE_MESSAGES.SOURCE_LABEL_PREFIX}: {learning.source_label}
          </p>
        )}

        {learning.source_raw && (
          <div className="space-y-2">
            <button
              className="text-xs text-muted-foreground hover:underline"
              onClick={() => setShowSource((prev) => !prev)}
              type="button"
            >
              {showSource
                ? KNOWLEDGE_MESSAGES.SOURCE_RAW_HIDE
                : KNOWLEDGE_MESSAGES.SOURCE_RAW_TOGGLE}
            </button>
            {showSource && (
              <pre className="overflow-x-auto whitespace-pre-wrap rounded bg-muted/50 p-3 text-xs">
                {learning.source_raw}
              </pre>
            )}
          </div>
        )}
      </CardContent>

      {editOpen && (
        <LearningEditDialog
          learning={learning}
          onOpenChange={setEditOpen}
          open
          projectId={projectId}
        />
      )}

      <AlertDialog onOpenChange={setConfirmDeleteOpen} open={confirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{KNOWLEDGE_MESSAGES.DELETE_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {KNOWLEDGE_MESSAGES.DELETE_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {remove.isError && (
            <p className="text-sm text-destructive">{KNOWLEDGE_MESSAGES.DELETE_FAILED}</p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={remove.isPending}>
              {KNOWLEDGE_MESSAGES.DELETE_CONFIRM_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction
              aria-busy={remove.isPending}
              disabled={remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {KNOWLEDGE_MESSAGES.DELETE_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
