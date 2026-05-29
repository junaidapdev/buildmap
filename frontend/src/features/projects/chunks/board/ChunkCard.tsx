import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, GripVertical } from 'lucide-react';
import { type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants/routes';
import { ChunkCardCompact } from '@/features/projects/chunks/board/ChunkCardCompact';
import { CHUNK_STATUS_ORDER } from '@/features/projects/chunks/board/columns';
import type { MoveChunkInput } from '@/features/projects/chunks/board/useMoveChunk';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { cn } from '@/lib/utils';
import type { ChunkStatus } from '@shared/schemas/chunks';

type ChunkCardProps = {
  chunk: ChunkRow;
  projectId: string;
  onMove: (input: MoveChunkInput) => void;
};

/**
 * A live, sortable chunk card. Only the dedicated grip is a drag activator, so the status select and
 * Open link stay fully clickable and keyboard-operable without fighting the drag sensors.
 */
export function ChunkCard({ chunk, projectId, onMove }: ChunkCardProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: chunk.id, data: { status: chunk.status } });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border bg-card p-3 text-card-foreground shadow-sm',
        isDragging && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          ref={setActivatorNodeRef}
          type="button"
          aria-label={CHUNKS_MESSAGES.CARD_DRAG_HANDLE_LABEL}
          className="mt-0.5 cursor-grab touch-none rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <ChunkCardCompact chunk={chunk} />

          <div className="mt-3 flex items-center justify-between gap-2">
            <Select
              value={chunk.status}
              onValueChange={(value) =>
                onMove({
                  chunkId: chunk.id,
                  newStatus: value as ChunkStatus,
                  newPosition: chunk.position,
                })
              }
            >
              <SelectTrigger aria-label={CHUNKS_MESSAGES.CARD_STATUS_LABEL} className="h-8 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHUNK_STATUS_ORDER.map((status) => (
                  <SelectItem key={status} value={status}>
                    {CHUNKS_MESSAGES.STATUS_LABELS[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button asChild size="sm" variant="ghost">
              <Link to={ROUTES.PROJECT_CHUNK(projectId, chunk.id)}>
                {CHUNKS_MESSAGES.CARD_OPEN_BUTTON}
                <ExternalLink aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </li>
  );
}
