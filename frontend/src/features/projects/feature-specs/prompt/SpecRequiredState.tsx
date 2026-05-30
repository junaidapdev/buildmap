import { Button } from '@/components/ui/button';
import { AGENT_PROMPT_MESSAGES } from '@/features/projects/feature-specs/prompt/messages';

type SpecRequiredStateProps = {
  onOpenSpec: () => void;
};

export function SpecRequiredState({ onOpenSpec }: SpecRequiredStateProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed p-12 text-center">
      <h3 className="text-lg font-semibold">{AGENT_PROMPT_MESSAGES.SPEC_REQUIRED_TITLE}</h3>
      <p className="text-muted-foreground">{AGENT_PROMPT_MESSAGES.SPEC_REQUIRED_BODY}</p>
      <Button onClick={onOpenSpec}>{AGENT_PROMPT_MESSAGES.SPEC_REQUIRED_OPEN}</Button>
    </div>
  );
}
