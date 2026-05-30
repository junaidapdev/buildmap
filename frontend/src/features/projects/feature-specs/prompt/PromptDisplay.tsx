import { Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AGENT_PROMPT_MESSAGES } from '@/features/projects/feature-specs/prompt/messages';
import { useCopyToClipboard } from '@/features/projects/feature-specs/prompt/useCopyToClipboard';
import type { AgentPromptRow } from '@/features/projects/feature-specs/prompt/useAgentPromptsForChunk';
import { formatRelativeTime } from '@/lib/relative-time';

type PromptDisplayProps = {
  prompt: AgentPromptRow;
  onRegenerate: () => void;
  isRegenerating: boolean;
};

export function PromptDisplay({ prompt, onRegenerate, isRegenerating }: PromptDisplayProps) {
  const clipboard = useCopyToClipboard();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function copyLabel(): string {
    switch (clipboard.state) {
      case 'busy':
        return AGENT_PROMPT_MESSAGES.COPY_BUTTON_BUSY;
      case 'done':
        return AGENT_PROMPT_MESSAGES.COPY_BUTTON_DONE;
      case 'error':
        return AGENT_PROMPT_MESSAGES.COPY_BUTTON_ERROR;
      default:
        return AGENT_PROMPT_MESSAGES.COPY_BUTTON;
    }
  }

  function handleConfirm(): void {
    setConfirmOpen(false);
    onRegenerate();
  }

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{AGENT_PROMPT_MESSAGES.VERSION_LABEL(prompt.version)}</Badge>
          <span className="text-xs text-muted-foreground">
            {AGENT_PROMPT_MESSAGES.LAST_UPDATED_PREFIX}{' '}
            {formatRelativeTime(prompt.updated_at, AGENT_PROMPT_MESSAGES.UPDATED_JUST_NOW)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            aria-busy={clipboard.state === 'busy'}
            disabled={clipboard.state === 'busy' || isRegenerating}
            onClick={() => clipboard.copy(prompt.content)}
            variant="outline"
          >
            <Copy aria-hidden="true" className="h-4 w-4" />
            {copyLabel()}
          </Button>
          <Button
            aria-busy={isRegenerating}
            disabled={isRegenerating || clipboard.state === 'busy'}
            onClick={() => setConfirmOpen(true)}
            variant="outline"
          >
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            {isRegenerating
              ? AGENT_PROMPT_MESSAGES.REGENERATE_BUSY
              : AGENT_PROMPT_MESSAGES.REGENERATE_BUTTON}
          </Button>
        </div>
      </div>

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{prompt.content}</ReactMarkdown>
      </div>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{AGENT_PROMPT_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>
              {AGENT_PROMPT_MESSAGES.REGENERATE_CONFIRM_BODY}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {AGENT_PROMPT_MESSAGES.REGENERATE_CONFIRM_CANCEL}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              {AGENT_PROMPT_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}
