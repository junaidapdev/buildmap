import { PromptTabContent } from '@/features/projects/feature-specs/prompt/PromptTabContent';

type PromptTabProps = {
  chunkId: string;
  onOpenSpec: () => void;
};

/**
 * Thin wrapper around PromptTabContent so ChunkDetailPage's import path stays stable while the
 * implementation lives in feature-specs/prompt/. Carries chunkId plus the onOpenSpec callback the
 * page passes in (it flips the controlled Tabs value back to 'spec').
 */
export function PromptTab({ chunkId, onOpenSpec }: PromptTabProps) {
  return <PromptTabContent chunkId={chunkId} onOpenSpec={onOpenSpec} />;
}
