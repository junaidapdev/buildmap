import { useMemo } from 'react';

import { ChunkListItem } from '@/features/projects/chunks/ChunkListItem';
import { ChunksPageActions } from '@/features/projects/chunks/ChunksPageActions';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';

type ChunksListViewProps = {
  projectId: string;
  chunks: ChunkRow[];
};

export function ChunksListView({ projectId, chunks }: ChunksListViewProps) {
  // The PRD is a prerequisite for chunks, so this read is almost always warm. Its features resolve
  // included_features ids to readable names; an id missing from the map renders as "(unknown)".
  const prd = useExistingPrd(projectId);

  const prdFeatures = useMemo(() => {
    const map = new Map<string, string>();
    for (const feature of prd.data?.content_json.features ?? []) {
      map.set(feature.id, feature.name);
    }
    return map;
  }, [prd.data]);

  // Dependencies are stored as sibling chunk refs; resolve them to chunk titles for display.
  const chunksByRef = useMemo(() => {
    const map = new Map<string, ChunkRow>();
    for (const chunk of chunks) {
      if (chunk.ref) {
        map.set(chunk.ref, chunk);
      }
    }
    return map;
  }, [chunks]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {CHUNKS_MESSAGES.COUNT_LABEL(chunks.length)}
        </span>
        <ChunksPageActions projectId={projectId} />
      </div>
      <ul className="space-y-3">
        {chunks.map((chunk) => (
          <ChunkListItem
            chunk={chunk}
            chunksByRef={chunksByRef}
            key={chunk.id}
            prdFeatures={prdFeatures}
          />
        ))}
      </ul>
      <p className="pt-2 text-center text-sm text-muted-foreground">
        {CHUNKS_MESSAGES.BOARD_VIEW_PLACEHOLDER}
      </p>
    </div>
  );
}
