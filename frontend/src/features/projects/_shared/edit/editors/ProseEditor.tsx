import { Textarea } from '@/components/ui/textarea';

type ProseEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProseEditor({ value, onChange }: ProseEditorProps) {
  return (
    <Textarea
      className="text-sm leading-relaxed"
      onChange={(event) => onChange(event.target.value)}
      rows={6}
      value={value}
    />
  );
}
