import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { PromptTabContent } from '@/features/projects/feature-specs/prompt/PromptTabContent';

type PromptTabProps = {
  chunk: Pick<ChunkRow, 'ref' | 'title'>;
  chunkId: string;
  onOpenSpec: () => void;
};

/**
 * Thin wrapper around PromptTabContent so ChunkDetailPage's import path stays stable while the
 * implementation lives in feature-specs/prompt/. Carries chunkId plus the onOpenSpec callback the
 * page passes in (it flips the controlled Tabs value back to 'spec').
 */
export function PromptTab({ chunk, chunkId, onOpenSpec }: PromptTabProps) {
  return <PromptTabContent chunk={chunk} chunkId={chunkId} onOpenSpec={onOpenSpec} />;
}
