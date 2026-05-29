import type { ArchitectureComponent } from '@shared/schemas/architecture';
import { Button } from '@/components/ui/button';
import { ComponentCardEditor } from '@/features/projects/architecture/edit/editors/ComponentCardEditor';
import { ARCHITECTURE_EDIT_MESSAGES } from '@/features/projects/architecture/edit/messages';

type ComponentListEditorProps = {
  value: ArchitectureComponent[];
  onChange: (value: ArchitectureComponent[]) => void;
};

export function ComponentListEditor({ value, onChange }: ComponentListEditorProps) {
  function updateAt(index: number, component: ArchitectureComponent): void {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? component : item)));
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

  function addComponent(): void {
    // crypto.randomUUID() is lowercase hex + hyphens, satisfying the kebab-case id contract. The user
    // fills name/description before saving; the schema rejects empty fields and an empty list.
    onChange([
      ...value,
      { id: crypto.randomUUID(), name: '', description: '', responsibilities: [''] },
    ]);
  }

  return (
    <div className="space-y-3">
      {value.map((component, index) => (
        <ComponentCardEditor
          component={component}
          index={index}
          key={component.id}
          onChange={(updated) => updateAt(index, updated)}
          onMove={(direction) => moveAt(index, direction)}
          onRemove={() => removeAt(index)}
          total={value.length}
        />
      ))}
      <Button onClick={addComponent} size="sm" type="button" variant="outline">
        {ARCHITECTURE_EDIT_MESSAGES.ADD_COMPONENT_BUTTON}
      </Button>
    </div>
  );
}
