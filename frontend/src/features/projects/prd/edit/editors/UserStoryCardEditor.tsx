import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';

import type { PrdContent } from '@shared/schemas/prd';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StringListEditor } from '@/features/projects/prd/edit/editors/StringListEditor';
import { PRD_EDIT_MESSAGES } from '@/features/projects/prd/edit/messages';

type StoryValue = PrdContent['user_stories'][number];

type UserStoryCardEditorProps = {
  story: StoryValue;
  index: number;
  total: number;
  onChange: (story: StoryValue) => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
};

export function UserStoryCardEditor({
  story,
  index,
  total,
  onChange,
  onRemove,
  onMove,
}: UserStoryCardEditorProps) {
  return (
    <Card className="bg-muted/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 space-y-1">
            <Label>{PRD_EDIT_MESSAGES.STORY_PERSONA_LABEL}</Label>
            <Input
              onChange={(event) => onChange({ ...story, persona: event.target.value })}
              value={story.persona}
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
          <Label>{PRD_EDIT_MESSAGES.STORY_STORY_LABEL}</Label>
          <Textarea
            onChange={(event) => onChange({ ...story, story: event.target.value })}
            rows={3}
            value={story.story}
          />
        </div>

        <div className="space-y-1">
          <Label>{PRD_EDIT_MESSAGES.STORY_CRITERIA_LABEL}</Label>
          <StringListEditor
            onChange={(criteria) => onChange({ ...story, acceptance_criteria: criteria })}
            value={story.acceptance_criteria}
          />
        </div>
      </CardContent>
    </Card>
  );
}
