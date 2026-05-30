import { TargetAgentSchema, type TargetAgent } from '@shared/schemas/agent-prompt';

import { AGENT_PROMPT_MESSAGES } from '@/features/projects/feature-specs/prompt/messages';
import { cn } from '@/lib/utils';

type AgentTargetSelectorProps = {
  value: TargetAgent;
  onChange: (value: TargetAgent) => void;
};

/** Segmented control over the three target agents. Active button uses aria-pressed for SR support. */
export function AgentTargetSelector({ value, onChange }: AgentTargetSelectorProps) {
  return (
    <div
      aria-label={AGENT_PROMPT_MESSAGES.TARGET_LABEL}
      className="inline-flex flex-wrap gap-1 rounded-md border bg-muted/30 p-1"
      role="group"
    >
      {TargetAgentSchema.options.map((option) => {
        const isActive = value === option;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              'rounded px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            key={option}
            onClick={() => onChange(option)}
            type="button"
          >
            {AGENT_PROMPT_MESSAGES.TARGET_OPTIONS[option]}
          </button>
        );
      })}
    </div>
  );
}
