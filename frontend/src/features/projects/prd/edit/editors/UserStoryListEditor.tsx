import type { PrdContent } from '@shared/schemas/prd';
import { Button } from '@/components/ui/button';
import { UserStoryCardEditor } from '@/features/projects/prd/edit/editors/UserStoryCardEditor';
import { PRD_EDIT_MESSAGES } from '@/features/projects/prd/edit/messages';

type StoryValue = PrdContent['user_stories'][number];

type UserStoryListEditorProps = {
  value: StoryValue[];
  onChange: (value: StoryValue[]) => void;
};

export function UserStoryListEditor({ value, onChange }: UserStoryListEditorProps) {
  function updateAt(index: number, story: StoryValue): void {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? story : item)));
  }

  function removeAt(index: number): void {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveAt(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= value.length) {
      return;
    }
    const next = [...value];
    const current = next[index];
    const swapWith = next[target];
    if (current === undefined || swapWith === undefined) {
      return;
    }
    next[index] = swapWith;
    next[target] = current;
    onChange(next);
  }

  function addStory(): void {
    // A unique kebab-case id (see FeatureListEditor); one empty acceptance criterion to satisfy the
    // min(1) schema. The user fills the fields before saving.
    onChange([
      ...value,
      { id: crypto.randomUUID(), persona: '', story: '', acceptance_criteria: [''] },
    ]);
  }

  return (
    <div className="space-y-3">
      {value.map((story, index) => (
        <UserStoryCardEditor
          index={index}
          key={story.id}
          onChange={(updated) => updateAt(index, updated)}
          onMove={(direction) => moveAt(index, direction)}
          onRemove={() => removeAt(index)}
          story={story}
          total={value.length}
        />
      ))}
      <Button onClick={addStory} size="sm" type="button" variant="outline">
        {PRD_EDIT_MESSAGES.ADD_USER_STORY_BUTTON}
      </Button>
    </div>
  );
}
