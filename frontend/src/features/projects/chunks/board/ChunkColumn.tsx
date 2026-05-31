import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { ChunkCard } from '@/features/projects/chunks/board/ChunkCard';
import { columnDroppableId } from '@/features/projects/chunks/board/columns';
import { STATUS_DOT_CLASS } from '@/features/projects/chunks/board/statusDotClass';
import type { MoveChunkInput } from '@/features/projects/chunks/board/useMoveChunk';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';
import type { ChunkStatus } from '@shared/schemas/chunks';

type ChunkColumnProps = {
  status: ChunkStatus;
  /** Chunks already filtered to this status and ordered by position. */
  chunks: ChunkRow[];
  projectId: string;
  project: Project;
  onMove: (input: MoveChunkInput) => void;
};

/**
 * One column on the chunk Kanban. Lumen-mockup-aligned header: status-colored dot + uppercase mono
 * label + tabular count. The subtitle that used to sit under the label has been folded out — the
 * label itself reads as the column purpose. The drop zone tints lightly when hovered with a card
 * so the target column reads immediately during a drag.
 */
export function ChunkColumn({ status, chunks, projectId, project, onMove }: ChunkColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDroppableId(status), data: { status } });

  return (
    <section
      aria-label={CHUNKS_MESSAGES.STATUS_LABELS[status]}
      className="flex w-80 shrink-0 flex-col rounded-xl border border-border-subtle bg-subtle/40"
    >
      <header className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn('size-1.5 rounded-full', STATUS_DOT_CLASS[status])}
          />
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-foreground">
            {CHUNKS_MESSAGES.STATUS_LABELS[status]}
          </h2>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {chunks.length}
          </span>
        </div>
      </header>

      <div
        className={cn('min-h-24 flex-1 p-2 transition-colors', isOver && 'bg-hover/40')}
        ref={setNodeRef}
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
                <ChunkCard
                  chunk={chunk}
                  key={chunk.id}
                  onMove={onMove}
                  project={project}
                  projectId={projectId}
                />
              ))}
            </ul>
          )}
        </SortableContext>
      </div>
    </section>
  );
}
