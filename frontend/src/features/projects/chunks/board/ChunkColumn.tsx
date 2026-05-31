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
 * One column on the chunk Kanban. The whole column visually lights up while a dragged card is
 * over its drop zone — brand-soft tint, brand border, and a stronger dot-color background on the
 * header — so "you're about to drop here" reads at a glance. Empty columns swap their muted text
 * for a brand-soft dashed placeholder while hovered.
 */
export function ChunkColumn({ status, chunks, projectId, project, onMove }: ChunkColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDroppableId(status), data: { status } });

  return (
    <section
      aria-label={CHUNKS_MESSAGES.STATUS_LABELS[status]}
      className={cn(
        'flex w-80 shrink-0 flex-col rounded-xl border transition-colors',
        isOver
          ? 'border-brand bg-brand-soft/40 shadow-sm'
          : 'border-border-subtle bg-subtle/40',
      )}
    >
      <header
        className={cn(
          'flex items-center justify-between gap-2 border-b px-3 py-2.5 transition-colors',
          isOver ? 'border-brand-soft-border' : 'border-border-subtle',
        )}
      >
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={cn(
              'rounded-full transition-all',
              STATUS_DOT_CLASS[status],
              isOver ? 'size-2 ring-2 ring-brand-soft-border ring-offset-1' : 'size-1.5',
            )}
          />
          <h2
            className={cn(
              'font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors',
              isOver ? 'text-brand-text' : 'text-foreground',
            )}
          >
            {CHUNKS_MESSAGES.STATUS_LABELS[status]}
          </h2>
          <span
            className={cn(
              'font-mono text-[11px] tabular-nums transition-colors',
              isOver ? 'text-brand-text' : 'text-muted-foreground',
            )}
          >
            {chunks.length}
          </span>
        </div>
      </header>

      <div className="min-h-24 flex-1 p-2" ref={setNodeRef}>
        <SortableContext
          items={chunks.map((chunk) => chunk.id)}
          strategy={verticalListSortingStrategy}
        >
          {chunks.length === 0 ? (
            <div
              className={cn(
                'flex h-24 items-center justify-center rounded-md border-2 border-dashed px-2 text-center text-[12px] transition-colors',
                isOver
                  ? 'border-brand bg-brand-soft/60 font-medium text-brand-text'
                  : 'border-border-subtle text-muted-foreground',
              )}
            >
              {isOver ? CHUNKS_MESSAGES.COLUMN_DROP_HINT : CHUNKS_MESSAGES.EMPTY_COLUMN[status]}
            </div>
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
              {/* Trailing dashed slot only appears while the column is being hovered. Gives the
                  user a clear "land at the bottom" target when dragging past the last card. */}
              {isOver && (
                <li
                  aria-hidden="true"
                  className="h-12 rounded-md border-2 border-dashed border-brand bg-brand-soft/60"
                />
              )}
            </ul>
          )}
        </SortableContext>
      </div>
    </section>
  );
}
