import { useEffect, useRef, type ReactNode } from 'react';

import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { FeatureSpecError } from '@/features/projects/feature-specs/FeatureSpecError';
import { FeatureSpecPending } from '@/features/projects/feature-specs/FeatureSpecPending';
import { FeatureSpecView } from '@/features/projects/feature-specs/FeatureSpecView';
import { useExistingFeatureSpec } from '@/features/projects/feature-specs/useExistingFeatureSpec';
import { useGenerateFeatureSpec } from '@/features/projects/feature-specs/useGenerateFeatureSpec';

type FeatureSpecTabProps = {
  chunk: Pick<ChunkRow, 'ref' | 'title'>;
  chunkId: string;
};

export function FeatureSpecTab({ chunk, chunkId }: FeatureSpecTabProps) {
  const spec = useExistingFeatureSpec(chunkId);
  const generate = useGenerateFeatureSpec(chunkId);
  const generateSpec = generate.mutate;
  const startedForChunkRef = useRef<string | null>(null);

  useEffect(() => {
    // Wait for the lookup; a failed read must not trigger generation.
    if (spec.isPending || spec.isError) {
      return;
    }
    // A spec already exists (return visit): display it, never auto-regenerate.
    if (spec.data) {
      return;
    }
    // Track which chunk generation fired for: blocks StrictMode replay and still fires for a
    // different chunk opened in the same component instance.
    if (startedForChunkRef.current === chunkId) {
      return;
    }

    startedForChunkRef.current = chunkId;
    generateSpec();
  }, [spec.isPending, spec.isError, spec.data, generateSpec, chunkId]);

  let body: ReactNode;

  if (spec.isPending) {
    body = <FeatureSpecPending />;
  } else if (spec.data) {
    body = <FeatureSpecView chunk={chunk} chunkId={chunkId} spec={spec.data} />;
  } else if (spec.isError) {
    body = <FeatureSpecError onRetry={() => void spec.refetch()} />;
  } else if (generate.isError) {
    body = <FeatureSpecError onRetry={() => generateSpec()} />;
  } else {
    // No spec yet: generation is idle or in flight.
    body = <FeatureSpecPending />;
  }

  return body;
}
