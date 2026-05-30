import { ArrowDown, ArrowUp, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type {
  ArchitectureDecision,
  ArchitectureDecisionStatus,
} from '@shared/schemas/architecture';
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAiErrorCopy } from '@/features/_shared/ai-error-copy';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ARCHITECTURE_EDIT_MESSAGES } from '@/features/projects/architecture/edit/messages';
import { useRegenerateSingleDecision } from '@/features/projects/architecture/edit/useRegenerateSingleDecision';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';

const STATUS_KEYS: ArchitectureDecisionStatus[] = [
  'proposed',
  'accepted',
  'superseded',
  'rejected',
];

type DecisionCardEditorProps = {
  decision: ArchitectureDecision;
  index: number;
  total: number;
  projectId: string;
  onChange: (decision: ArchitectureDecision) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

export function DecisionCardEditor({
  decision,
  index,
  total,
  projectId,
  onChange,
  onRemove,
  onMove,
}: DecisionCardEditorProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const regenerate = useRegenerateSingleDecision(projectId);

  async function handleRegenerate(): Promise<void> {
    setConfirmOpen(false);
    try {
      const result = await regenerate.mutateAsync(decision.id);
      // The Edge Function preserves the id, so this swaps the decision in place within the draft.
      if (result.mode === 'single_decision') {
        onChange(result.value);
      }
    } catch {
      // regenerate.isError drives the inline message.
    }
  }

  return (
    <Card className="bg-muted/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <Label>{ARCHITECTURE_EDIT_MESSAGES.DECISION_TITLE_LABEL}</Label>
            <Input
              onChange={(event) => onChange({ ...decision, title: event.target.value })}
              value={decision.title}
            />
          </div>
          <div className="flex shrink-0 gap-1 pt-6">
            <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  aria-busy={regenerate.isPending}
                  aria-label={ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE_LABEL}
                  disabled={regenerate.isPending}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <RefreshCw aria-hidden="true" className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE_CONFIRM_TITLE}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE_CONFIRM_BODY}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE_CONFIRM_CANCEL}
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleRegenerate}>
                    {ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE_CONFIRM_CONFIRM}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              aria-label={ARCHITECTURE_EDIT_MESSAGES.MOVE_UP_LABEL}
              disabled={index === 0 || regenerate.isPending}
              onClick={() => onMove(-1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowUp aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              aria-label={ARCHITECTURE_EDIT_MESSAGES.MOVE_DOWN_LABEL}
              disabled={index === total - 1 || regenerate.isPending}
              onClick={() => onMove(1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              aria-label={ARCHITECTURE_EDIT_MESSAGES.REMOVE_LABEL}
              disabled={regenerate.isPending}
              onClick={onRemove}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <Label>{ARCHITECTURE_EDIT_MESSAGES.DECISION_STATUS_LABEL}</Label>
          <Select
            onValueChange={(next) =>
              onChange({ ...decision, status: next as ArchitectureDecisionStatus })
            }
            value={decision.status}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_KEYS.map((status) => (
                <SelectItem key={status} value={status}>
                  {ARCHITECTURE_MESSAGES.DECISION_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>{ARCHITECTURE_EDIT_MESSAGES.DECISION_CONTEXT_LABEL}</Label>
          <Textarea
            onChange={(event) => onChange({ ...decision, context: event.target.value })}
            rows={3}
            value={decision.context}
          />
        </div>

        <div className="space-y-1">
          <Label>{ARCHITECTURE_EDIT_MESSAGES.DECISION_DECISION_LABEL}</Label>
          <Textarea
            onChange={(event) => onChange({ ...decision, decision: event.target.value })}
            rows={3}
            value={decision.decision}
          />
        </div>

        <div className="space-y-1">
          <Label>{ARCHITECTURE_EDIT_MESSAGES.DECISION_CONSEQUENCES_LABEL}</Label>
          <Textarea
            onChange={(event) => onChange({ ...decision, consequences: event.target.value })}
            rows={3}
            value={decision.consequences}
          />
        </div>

        {regenerate.isError && (
          <p className="text-sm text-destructive">
            {getAiErrorCopy(
              regenerate.error,
              ARCHITECTURE_EDIT_MESSAGES.DECISION_REGENERATE_FAILED,
            )}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
