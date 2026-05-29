import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { GripVertical } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChunkCardCompact } from '@/features/projects/chunks/board/ChunkCardCompact';
import { ChunkColumn } from '@/features/projects/chunks/board/ChunkColumn';
import {
  CHUNK_STATUS_ORDER,
  parseColumnDroppableId,
} from '@/features/projects/chunks/board/columns';
import { useMoveChunk } from '@/features/projects/chunks/board/useMoveChunk';
import { ChunksPageActions } from '@/features/projects/chunks/ChunksPageActions';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import type { ChunkStatus } from '@shared/schemas/chunks';

type ChunkBoardProps = {
  projectId: string;
  chunks: ChunkRow[];
};

type ColumnMap = Record<ChunkStatus, ChunkRow[]>;

/** Groups chunks into their status columns, each ordered by global position. */
function groupByStatus(chunks: ChunkRow[]): ColumnMap {
  const map: ColumnMap = {
    backlog: [],
    ready: [],
    in_progress: [],
    needs_review: [],
    completed: [],
    blocked: [],
  };
  for (const chunk of [...chunks].sort((a, b) => a.position - b.position)) {
    map[chunk.status].push(chunk);
  }
  return map;
}

export function ChunkBoard({ projectId, chunks }: ChunkBoardProps) {
  const move = useMoveChunk(projectId);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const byColumn = useMemo(() => groupByStatus(chunks), [chunks]);
  const activeChunk = activeId ? chunks.find((chunk) => chunk.id === activeId) : undefined;

  function handleDragStart(event: DragStartEvent): void {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent): void {
    setActiveId(null);
    const { active, over } = event;
    if (!over) {
      return;
    }

    const draggedId = String(active.id);
    const dragged = chunks.find((chunk) => chunk.id === draggedId);
    if (!dragged) {
      return;
    }

    const overId = String(over.id);
    let newStatus: ChunkStatus = dragged.status;
    let newPosition: number = dragged.position;

    const overColumnStatus = parseColumnDroppableId(overId);
    if (overColumnStatus) {
      // Dropped on a column's empty area: land at the end of that column.
      newStatus = overColumnStatus;
      const columnChunks = byColumn[overColumnStatus];
      const last = columnChunks[columnChunks.length - 1];
      newPosition = last ? last.position + 1 : 0;
    } else {
      // Dropped on another card: take that card's status and slot.
      const overChunk = chunks.find((chunk) => chunk.id === overId);
      if (!overChunk) {
        return;
      }
      newStatus = overChunk.status;
      newPosition = overChunk.position;
    }

    if (newStatus === dragged.status && newPosition === dragged.position) {
      return;
    }

    move.mutate({ chunkId: draggedId, newStatus, newPosition });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {CHUNKS_MESSAGES.COUNT_LABEL(chunks.length)}
        </span>
        <ChunksPageActions projectId={projectId} />
      </div>

      {move.isError && (
        <Alert variant="destructive">
          <AlertDescription>{CHUNKS_MESSAGES.MOVE_FAILED}</AlertDescription>
        </Alert>
      )}

      <DndContext
        collisionDetection={closestCorners}
        modifiers={[restrictToWindowEdges]}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        sensors={sensors}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {CHUNK_STATUS_ORDER.map((status) => (
            <ChunkColumn
              chunks={byColumn[status]}
              key={status}
              onMove={move.mutate}
              projectId={projectId}
              status={status}
            />
          ))}
        </div>
        <DragOverlay modifiers={[restrictToWindowEdges]}>
          {activeChunk ? (
            <div className="w-72 rounded-lg border bg-card p-3 text-card-foreground shadow-lg">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-muted-foreground">
                  <GripVertical aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <ChunkCardCompact chunk={activeChunk} />
                </div>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
