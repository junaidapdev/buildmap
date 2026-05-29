import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

import type { ArchitectureExternalService } from '@shared/schemas/architecture';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ARCHITECTURE_EDIT_MESSAGES } from '@/features/projects/architecture/edit/messages';

type ExternalServiceCardEditorProps = {
  service: ArchitectureExternalService;
  index: number;
  total: number;
  onChange: (service: ArchitectureExternalService) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

export function ExternalServiceCardEditor({
  service,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: ExternalServiceCardEditorProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <Label>{ARCHITECTURE_EDIT_MESSAGES.SERVICE_NAME_LABEL}</Label>
            <Input
              onChange={(event) => onChange({ ...service, name: event.target.value })}
              value={service.name}
            />
          </div>
          <div className="flex shrink-0 gap-1 pt-6">
            <Button
              aria-label={ARCHITECTURE_EDIT_MESSAGES.MOVE_UP_LABEL}
              disabled={index === 0}
              onClick={() => onMove(-1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowUp aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              aria-label={ARCHITECTURE_EDIT_MESSAGES.MOVE_DOWN_LABEL}
              disabled={index === total - 1}
              onClick={() => onMove(1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              aria-label={ARCHITECTURE_EDIT_MESSAGES.REMOVE_LABEL}
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
          <Label>{ARCHITECTURE_EDIT_MESSAGES.SERVICE_PURPOSE_LABEL}</Label>
          <Textarea
            onChange={(event) => onChange({ ...service, purpose: event.target.value })}
            rows={2}
            value={service.purpose}
          />
        </div>

        <div className="space-y-1">
          <Label>{ARCHITECTURE_EDIT_MESSAGES.SERVICE_NOTES_LABEL}</Label>
          <Textarea
            onChange={(event) => onChange({ ...service, notes: event.target.value })}
            rows={2}
            value={service.notes ?? ''}
          />
        </div>
      </CardContent>
    </Card>
  );
}
