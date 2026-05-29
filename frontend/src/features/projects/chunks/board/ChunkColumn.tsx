import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Badge } from '@/components/ui/badge';
import { ChunkCard } from '@/features/projects/chunks/board/ChunkCard';
import { columnDroppableId } from '@/features/projects/chunks/board/columns';
import type { MoveChunkInput } from '@/features/projects/chunks/board/useMoveChunk';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { cn } from '@/lib/utils';
import type { ChunkStatus } from '@shared/schemas/chunks';

type ChunkColumnProps = {
  status: ChunkStatus;
  /** Chunks already filtered to this status and ordered by position. */
  chunks: ChunkRow[];
  projectId: string;
  onMove: (input: MoveChunkInput) => void;
};

export function ChunkColumn({ status, chunks, projectId, onMove }: ChunkColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDroppableId(status), data: { status } });

  return (
    <section
      aria-label={CHUNKS_MESSAGES.STATUS_LABELS[status]}
      className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30"
    >
      <header className="flex items-baseline justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">{CHUNKS_MESSAGES.STATUS_LABELS[status]}</h2>
          <p className="text-xs text-muted-foreground">
            {CHUNKS_MESSAGES.COLUMN_DESCRIPTIONS[status]}
          </p>
        </div>
        <Badge variant="secondary">{chunks.length}</Badge>
      </header>

      <div
        ref={setNodeRef}
        className={cn('min-h-24 flex-1 p-2 transition-colors', isOver && 'bg-muted/60')}
      >
        <SortableContext
          items={chunks.map((chunk) => chunk.id)}
          strategy={verticalListSortingStrategy}
        >
          {chunks.length === 0 ? (
            <p className="px-1 py-6 text-center text-xs text-muted-foreground">
              {CHUNKS_MESSAGES.EMPTY_COLUMN[status]}
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {chunks.map((chunk) => (
                <ChunkCard chunk={chunk} key={chunk.id} onMove={onMove} projectId={projectId} />
              ))}
            </ul>
          )}
        </SortableContext>
      </div>
    </section>
  );
}
