import { Button } from '@/components/ui/button';
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';

type KnowledgeEmptyProps = {
  onAddNotes: () => void;
};

export function KnowledgeEmpty({ onAddNotes }: KnowledgeEmptyProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed p-12 text-center">
      <h3 className="text-lg font-semibold">{KNOWLEDGE_MESSAGES.EMPTY_TITLE}</h3>
      <p className="text-muted-foreground">{KNOWLEDGE_MESSAGES.EMPTY_BODY}</p>
      <Button onClick={onAddNotes}>{KNOWLEDGE_MESSAGES.ADD_NOTES_BUTTON}</Button>
    </div>
  );
}
