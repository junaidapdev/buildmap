import { ArrowDown, ArrowUp, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PRD_EDIT_MESSAGES } from '@/features/projects/prd/edit/messages';

type StringListEditorProps = {
  value: string[];
  onChange: (value: string[]) => void;
};

export function StringListEditor({ value, onChange }: StringListEditorProps) {
  function updateItem(index: number, text: string): void {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? text : item)));
  }

  function removeItem(index: number): void {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function moveItem(index: number, direction: -1 | 1): void {
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

  return (
    <div className="space-y-2">
      {value.map((item, index) => (
        <div className="flex items-center gap-2" key={index}>
          <Input onChange={(event) => updateItem(index, event.target.value)} value={item} />
          <Button
            aria-label={PRD_EDIT_MESSAGES.MOVE_UP_LABEL}
            disabled={index === 0}
            onClick={() => moveItem(index, -1)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowUp aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            aria-label={PRD_EDIT_MESSAGES.MOVE_DOWN_LABEL}
            disabled={index === value.length - 1}
            onClick={() => moveItem(index, 1)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <ArrowDown aria-hidden="true" className="h-4 w-4" />
          </Button>
          <Button
            aria-label={PRD_EDIT_MESSAGES.REMOVE_LABEL}
            onClick={() => removeItem(index)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={() => onChange([...value, ''])} size="sm" type="button" variant="outline">
        {PRD_EDIT_MESSAGES.ADD_ITEM_BUTTON}
      </Button>
    </div>
  );
}
