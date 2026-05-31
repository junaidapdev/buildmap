import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreVertical } from 'lucide-react';
import { type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { ChunkCardCompact } from '@/features/projects/chunks/board/ChunkCardCompact';
import { CHUNK_STATUS_ORDER } from '@/features/projects/chunks/board/columns';
import type { MoveChunkInput } from '@/features/projects/chunks/board/useMoveChunk';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';
import type { ChunkStatus } from '@shared/schemas/chunks';

type ChunkCardProps = {
  chunk: ChunkRow;
  projectId: string;
  project: Project;
  onMove: (input: MoveChunkInput) => void;
};

/**
 * Live, sortable chunk card. Lumen-mockup-aligned:
 *  - No visible grip icon — the whole card is the drag activator (dnd-kit's 5px activation
 *    distance keeps clicks from accidentally starting a drag).
 *  - Overflow menu (⋮) in the top-right opens a dropdown with "Open chunk" and a status radio
 *    group (replaces the inline Select + Open link from the previous design).
 *  - The card body is pure ChunkCardCompact — number, size pill, title, description, in-progress
 *    dot, blocked hint, file count + agent label footer.
 *
 * The overflow menu trigger swallows pointer events so clicking it doesn't start a drag, and
 * stopPropagation on the trigger keeps Radix's portal happy.
 */
export function ChunkCard({ chunk, projectId, project, onMove }: ChunkCardProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chunk.id,
    data: { status: chunk.status },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Whole card is the drag activator. We explicitly assign both setNodeRef AND setActivatorNodeRef
  // to the <li> via a combined callback ref — relying on dnd-kit's implicit "node is activator
  // when activator ref isn't set" default proved unreliable here (drags wouldn't start at all on
  // the card body). Spreading listeners/attributes on the same element with the activator ref
  // explicitly bound makes drag activation deterministic.
  function setRefs(node: HTMLElement | null) {
    setNodeRef(node);
    setActivatorNodeRef(node);
  }

  // Click-to-open. dnd-kit's PointerSensor has `distance: 5` activation, so a real click (no
  // pointer movement) doesn't start a drag — the click event fires after pointerup and we
  // navigate. A real drag (>5px movement) starts a drag operation and dnd-kit cancels the
  // pending click. The overflow menu wrapper stops both pointer- and click-propagation so
  // opening/closing the ⋮ menu never navigates and never starts a drag.
  function handleCardClick() {
    navigate(ROUTES.PROJECT_CHUNK(projectId, chunk.id));
  }

  function handleCardKeyDown(event: React.KeyboardEvent<HTMLLIElement>) {
    // Enter triggers the same navigation as click; Space is reserved for dnd-kit's keyboard
    // drag activation, so we deliberately don't handle it here.
    if (event.key === 'Enter') {
      event.preventDefault();
      navigate(ROUTES.PROJECT_CHUNK(projectId, chunk.id));
    }
  }

  return (
    <li
      ref={setRefs}
      style={style}
      className={cn(
        'group relative cursor-grab touch-none select-none rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        isDragging && 'opacity-50',
      )}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      {...attributes}
      {...listeners}
    >
      <ChunkCardCompact chunk={chunk} project={project} />

      {/* Overflow menu pinned to the top-right corner of the card. Stops both pointer- and
          click-propagation so opening the menu never starts a drag AND never triggers the
          card-level navigation. */}
      <div
        className="absolute right-2 top-2"
        onClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={CHUNKS_MESSAGES.CARD_OVERFLOW_LABEL}
              className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
              size="icon"
              variant="ghost"
            >
              <MoreVertical aria-hidden="true" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => navigate(ROUTES.PROJECT_CHUNK(projectId, chunk.id))}>
              {CHUNKS_MESSAGES.CARD_OPEN_BUTTON} chunk
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {CHUNKS_MESSAGES.CARD_STATUS_LABEL}
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              onValueChange={(value) =>
                onMove({
                  chunkId: chunk.id,
                  newStatus: value as ChunkStatus,
                  newPosition: chunk.position,
                })
              }
              value={chunk.status}
            >
              {CHUNK_STATUS_ORDER.map((status) => (
                <DropdownMenuRadioItem key={status} value={status}>
                  {CHUNKS_MESSAGES.STATUS_LABELS[status]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}
