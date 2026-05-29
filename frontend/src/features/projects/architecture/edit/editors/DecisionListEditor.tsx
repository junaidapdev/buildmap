import type { ArchitectureDecision } from '@shared/schemas/architecture';
import { Button } from '@/components/ui/button';
import { DecisionCardEditor } from '@/features/projects/architecture/edit/editors/DecisionCardEditor';
import { ARCHITECTURE_EDIT_MESSAGES } from '@/features/projects/architecture/edit/messages';

type DecisionListEditorProps = {
  value: ArchitectureDecision[];
  onChange: (value: ArchitectureDecision[]) => void;
  projectId: string;
};

export function DecisionListEditor({ value, onChange, projectId }: DecisionListEditorProps) {
  function updateAt(index: number, decision: ArchitectureDecision): void {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? decision : item)));
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

  function addDecision(): void {
    // A new decision starts in "proposed". Its crypto.randomUUID() id is not yet in the saved
    // architecture, so per-decision regenerate stays disabled-by-failure until the section is saved.
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        title: '',
        context: '',
        decision: '',
        consequences: '',
        status: 'proposed',
      },
    ]);
  }

  return (
    <div className="space-y-3">
      {value.map((decision, index) => (
        <DecisionCardEditor
          decision={decision}
          index={index}
          key={decision.id}
          onChange={(updated) => updateAt(index, updated)}
          onMove={(direction) => moveAt(index, direction)}
          onRemove={() => removeAt(index)}
          projectId={projectId}
          total={value.length}
        />
      ))}
      <Button onClick={addDecision} size="sm" type="button" variant="outline">
        {ARCHITECTURE_EDIT_MESSAGES.ADD_DECISION_BUTTON}
      </Button>
    </div>
  );
}
