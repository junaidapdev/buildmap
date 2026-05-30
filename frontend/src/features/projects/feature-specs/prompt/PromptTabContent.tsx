import { useState, type ReactNode } from 'react';

import type { TargetAgent } from '@shared/schemas/agent-prompt';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { useExistingFeatureSpec } from '@/features/projects/feature-specs/useExistingFeatureSpec';
import { AgentTargetSelector } from '@/features/projects/feature-specs/prompt/AgentTargetSelector';
import { PromptDisplay } from '@/features/projects/feature-specs/prompt/PromptDisplay';
import { PromptEmptyState } from '@/features/projects/feature-specs/prompt/PromptEmptyState';
import { PromptError } from '@/features/projects/feature-specs/prompt/PromptError';
import { PromptPending } from '@/features/projects/feature-specs/prompt/PromptPending';
import { SpecRequiredState } from '@/features/projects/feature-specs/prompt/SpecRequiredState';
import { useAgentPromptsForChunk } from '@/features/projects/feature-specs/prompt/useAgentPromptsForChunk';
import { useGenerateAgentPrompt } from '@/features/projects/feature-specs/prompt/useGenerateAgentPrompt';

type PromptTabContentProps = {
  chunk: Pick<ChunkRow, 'ref' | 'title'>;
  chunkId: string;
  onOpenSpec: () => void;
};

/**
 * Orchestrates the Prompt tab. Three branches before showing the prompt itself:
 *  1. spec query still loading -> Pending
 *  2. spec query failed -> Error
 *  3. no feature spec yet for this chunk -> SpecRequired (deep-links back to the Spec tab)
 * Then, with a spec in hand: target selector + per-target Display / Empty / Pending depending on
 * whether a row exists for the active target and whether a generation is in flight against it.
 */
export function PromptTabContent({ chunk, chunkId, onOpenSpec }: PromptTabContentProps) {
  const specQuery = useExistingFeatureSpec(chunkId);
  const promptsQuery = useAgentPromptsForChunk(chunkId);
  const generate = useGenerateAgentPrompt(chunkId);
  const [target, setTarget] = useState<TargetAgent>('claude_code');

  let body: ReactNode;

  if (specQuery.isPending) {
    body = <PromptPending />;
  } else if (specQuery.isError) {
    body = <PromptError onRetry={() => void specQuery.refetch()} />;
  } else if (!specQuery.data) {
    body = <SpecRequiredState onOpenSpec={onOpenSpec} />;
  } else if (promptsQuery.isPending) {
    body = <PromptPending />;
  } else if (promptsQuery.isError) {
    body = <PromptError onRetry={() => void promptsQuery.refetch()} />;
  } else {
    const promptsByTarget = promptsQuery.data ?? {};
    const currentPrompt = promptsByTarget[target];
    const isGeneratingForCurrentTarget =
      generate.isPending && generate.variables?.targetAgent === target;

    let inner: ReactNode;
    if (isGeneratingForCurrentTarget) {
      inner = <PromptPending />;
    } else if (currentPrompt) {
      inner = (
        <PromptDisplay
          chunk={chunk}
          isRegenerating={generate.isPending}
          onRegenerate={() => generate.mutate({ targetAgent: target })}
          prompt={currentPrompt}
        />
      );
    } else {
      inner = (
        <PromptEmptyState
          isPending={generate.isPending}
          onGenerate={() => generate.mutate({ targetAgent: target })}
        />
      );
    }

    body = (
      <div className="space-y-6">
        <AgentTargetSelector onChange={setTarget} value={target} />
        {inner}
        {generate.isError && (
          <PromptError onRetry={() => generate.mutate({ targetAgent: target })} />
        )}
      </div>
    );
  }

  return body;
}
