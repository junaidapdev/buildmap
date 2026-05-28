import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

import type { PrdContent, PrdFeaturePriority } from '@shared/schemas/prd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PRD_EDIT_MESSAGES } from '@/features/projects/prd/edit/messages';

type FeatureValue = PrdContent['features'][number];

const PRIORITY_KEYS: PrdFeaturePriority[] = ['must_have', 'should_have', 'nice_to_have'];

type FeatureCardEditorProps = {
  feature: FeatureValue;
  index: number;
  total: number;
  onChange: (feature: FeatureValue) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

export function FeatureCardEditor({
  feature,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: FeatureCardEditorProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <Label>{PRD_EDIT_MESSAGES.FEATURE_NAME_LABEL}</Label>
            <Input
              onChange={(event) => onChange({ ...feature, name: event.target.value })}
              value={feature.name}
            />
          </div>
          <div className="flex shrink-0 gap-1 pt-6">
            <Button
              aria-label={PRD_EDIT_MESSAGES.MOVE_UP_LABEL}
              disabled={index === 0}
              onClick={() => onMove(-1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowUp aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              aria-label={PRD_EDIT_MESSAGES.MOVE_DOWN_LABEL}
              disabled={index === total - 1}
              onClick={() => onMove(1)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <ArrowDown aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              aria-label={PRD_EDIT_MESSAGES.REMOVE_LABEL}
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
          <Label>{PRD_EDIT_MESSAGES.FEATURE_DESCRIPTION_LABEL}</Label>
          <Textarea
            onChange={(event) => onChange({ ...feature, description: event.target.value })}
            rows={3}
            value={feature.description}
          />
        </div>

        <div className="space-y-1">
          <Label>{PRD_EDIT_MESSAGES.FEATURE_PRIORITY_LABEL}</Label>
          <Select
            onValueChange={(next) => onChange({ ...feature, priority: next as PrdFeaturePriority })}
            value={feature.priority}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_KEYS.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {PRD_EDIT_MESSAGES.PRIORITY_OPTIONS[priority]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
