import { FileText } from 'lucide-react';

import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

type ChunkCardCompactProps = {
  chunk: ChunkRow;
  project: Project;
};

/**
 * Pure visual presentation of a chunk card — no drag, status, or navigation concerns. Rendered
 * inside the live sortable card and (identically) inside the drag overlay, so the dragged ghost
 * matches the card it came from. Layout follows the Lumen mockup:
 *
 *   ┌───────────────────────────────────────────────────────┐
 *   │ #N                                          [SIZE]    │
 *   │ Title (semibold, two-line clamp)                      │
 *   │ Description (muted, two-line clamp)                   │
 *   │ ────────────────────────────────────────────────────  │
 *   │ ⚠ Blocked hint (only when status === 'blocked')       │
 *   │ ────────────────────────────────────────────────────  │
 *   │ 📄 N files                              Agent name    │
 *   └───────────────────────────────────────────────────────┘
 *
 * Numbering uses `chunk.position + 1`. `move_chunk` re-densifies positions to 0..N-1 after each
 * move, so #N is stable as long as positions stay dense.
 */
export function ChunkCardCompact({ chunk, project }: ChunkCardCompactProps) {
  const number = chunk.position + 1;
  const isInProgress = chunk.status === 'in_progress';
  const isBlocked = chunk.status === 'blocked';
  const fileCount = chunk.included_features.length;
  const agentLabel = project.preferred_agent
    ? CHUNKS_MESSAGES.CARD_AGENT_LABELS[project.preferred_agent]
    : CHUNKS_MESSAGES.CARD_AGENT_FALLBACK;

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            {CHUNKS_MESSAGES.CARD_NUMBER_PREFIX}
            {number}
          </span>
          <span
            aria-label={CHUNKS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort]}
            className="inline-flex items-center justify-center rounded-md border border-border-subtle bg-subtle/60 px-1.5 py-px font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
            title={CHUNKS_MESSAGES.EFFORT_TOOLTIPS[chunk.estimated_effort]}
          >
            {CHUNKS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort]}
          </span>
          {isInProgress && (
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-status-done-fg"
              title={CHUNKS_MESSAGES.STATUS_LABELS.in_progress}
            />
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-1.5">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">
          {chunk.title}
        </h3>
        {chunk.description && (
          <p className="line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
            {chunk.description}
          </p>
        )}
      </div>

      {isBlocked && (
        <p
          className={cn(
            'flex items-start gap-2 rounded-md border px-2.5 py-2 text-[12px] leading-snug',
            'border-status-blocked-border bg-status-blocked-bg text-status-blocked-fg',
          )}
          role="status"
        >
          <span aria-hidden="true">⚠</span>
          <span>{CHUNKS_MESSAGES.CARD_BLOCKED_HINT}</span>
        </p>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-border-subtle pt-2.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <FileText aria-hidden="true" className="h-3 w-3" />
          {CHUNKS_MESSAGES.CARD_FILES_LABEL(fileCount)}
        </span>
        <span className="truncate">{agentLabel}</span>
      </div>
    </div>
  );
}
