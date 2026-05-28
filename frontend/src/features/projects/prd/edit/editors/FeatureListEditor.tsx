import type { PrdContent } from '@shared/schemas/prd';
import { Button } from '@/components/ui/button';
import { FeatureCardEditor } from '@/features/projects/prd/edit/editors/FeatureCardEditor';
import { PRD_EDIT_MESSAGES } from '@/features/projects/prd/edit/messages';

type FeatureValue = PrdContent['features'][number];

type FeatureListEditorProps = {
  value: FeatureValue[];
  onChange: (value: FeatureValue[]) => void;
};

export function FeatureListEditor({ value, onChange }: FeatureListEditorProps) {
  function updateAt(index: number, feature: FeatureValue): void {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? feature : item)));
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

  function addFeature(): void {
    // crypto.randomUUID() is lowercase hex + hyphens, so it satisfies the kebab-case id contract and
    // is unique. The user fills name/description before saving; the schema rejects empty fields.
    onChange([
      ...value,
      { id: crypto.randomUUID(), name: '', description: '', priority: 'should_have' },
    ]);
  }

  return (
    <div className="space-y-3">
      {value.map((feature, index) => (
        <FeatureCardEditor
          feature={feature}
          index={index}
          key={feature.id}
          onChange={(updated) => updateAt(index, updated)}
          onMove={(direction) => moveAt(index, direction)}
          onRemove={() => removeAt(index)}
          total={value.length}
        />
      ))}
      <Button onClick={addFeature} size="sm" type="button" variant="outline">
        {PRD_EDIT_MESSAGES.ADD_FEATURE_BUTTON}
      </Button>
    </div>
  );
}
