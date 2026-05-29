import type { ArchitectureExternalService } from '@shared/schemas/architecture';
import { Button } from '@/components/ui/button';
import { ExternalServiceCardEditor } from '@/features/projects/architecture/edit/editors/ExternalServiceCardEditor';
import { ARCHITECTURE_EDIT_MESSAGES } from '@/features/projects/architecture/edit/messages';

type ExternalServiceListEditorProps = {
  value: ArchitectureExternalService[];
  onChange: (value: ArchitectureExternalService[]) => void;
};

export function ExternalServiceListEditor({ value, onChange }: ExternalServiceListEditorProps) {
  function updateAt(index: number, service: ArchitectureExternalService): void {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? service : item)));
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

  function addService(): void {
    // notes is optional; omit it so an untouched service stays note-free. The user fills name/purpose
    // before saving; the schema rejects empty required fields.
    onChange([...value, { id: crypto.randomUUID(), name: '', purpose: '' }]);
  }

  return (
    <div className="space-y-3">
      {value.map((service, index) => (
        <ExternalServiceCardEditor
          index={index}
          key={service.id}
          onChange={(updated) => updateAt(index, updated)}
          onMove={(direction) => moveAt(index, direction)}
          onRemove={() => removeAt(index)}
          service={service}
          total={value.length}
        />
      ))}
      <Button onClick={addService} size="sm" type="button" variant="outline">
        {ARCHITECTURE_EDIT_MESSAGES.ADD_SERVICE_BUTTON}
      </Button>
    </div>
  );
}
