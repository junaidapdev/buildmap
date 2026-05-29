import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

import type { ArchitectureComponent } from '@shared/schemas/architecture';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StringListEditor } from '@/features/projects/_shared/edit/editors/StringListEditor';
import { ARCHITECTURE_EDIT_MESSAGES } from '@/features/projects/architecture/edit/messages';

type ComponentCardEditorProps = {
  component: ArchitectureComponent;
  index: number;
  total: number;
  onChange: (component: ArchitectureComponent) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

export function ComponentCardEditor({
  component,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: ComponentCardEditorProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <Label>{ARCHITECTURE_EDIT_MESSAGES.COMPONENT_NAME_LABEL}</Label>
            <Input
              onChange={(event) => onChange({ ...component, name: event.target.value })}
              value={component.name}
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
          <Label>{ARCHITECTURE_EDIT_MESSAGES.COMPONENT_DESCRIPTION_LABEL}</Label>
          <Textarea
            onChange={(event) => onChange({ ...component, description: event.target.value })}
            rows={3}
            value={component.description}
          />
        </div>

        <div className="space-y-1">
          <Label>{ARCHITECTURE_EDIT_MESSAGES.COMPONENT_RESPONSIBILITIES_LABEL}</Label>
          <StringListEditor
            onChange={(responsibilities) => onChange({ ...component, responsibilities })}
            value={component.responsibilities}
          />
        </div>
      </CardContent>
    </Card>
  );
}
