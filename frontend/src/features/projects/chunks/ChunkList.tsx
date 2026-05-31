import { ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { STATUS_DOT_CLASS } from '@/features/projects/chunks/board/statusDotClass';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { cn } from '@/lib/utils';
import type { Project } from '@/types/project';

type ChunkListProps = {
  chunks: ChunkRow[];
  projectId: string;
  project: Project;
};

/**
 * Flat read-only list alternative to the Kanban board. Each row shows:
 *   #N · status dot · title (truncated) · size pill · files · agent · open chevron
 *
 * No drag. Status changes happen on the Board view (or from the chunk's detail page); the List
 * view is for scanning a long backlog without the column overhead.
 */
export function ChunkList({ chunks, projectId, project }: ChunkListProps) {
  const sorted = [...chunks].sort((a, b) => a.position - b.position);
  const agentLabel = project.preferred_agent
    ? CHUNKS_MESSAGES.CARD_AGENT_LABELS[project.preferred_agent]
    : CHUNKS_MESSAGES.CARD_AGENT_FALLBACK;

  return (
    <ul className="divide-y divide-border-subtle rounded-lg border border-border-subtle bg-card">
      {sorted.map((chunk) => {
        const number = chunk.position + 1;
        const fileCount = chunk.included_features.length;
        return (
          <li key={chunk.id}>
            <Link
              className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-subtle/40"
              to={ROUTES.PROJECT_CHUNK(projectId, chunk.id)}
            >
              <span className="w-8 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                {CHUNKS_MESSAGES.CARD_NUMBER_PREFIX}
                {number}
              </span>
              <span
                aria-hidden="true"
                className={cn('size-1.5 shrink-0 rounded-full', STATUS_DOT_CLASS[chunk.status])}
                title={CHUNKS_MESSAGES.STATUS_LABELS[chunk.status]}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-foreground">{chunk.title}</p>
                {chunk.description && (
                  <p className="truncate text-[12px] text-muted-foreground">{chunk.description}</p>
                )}
              </div>
              <span
                aria-label={CHUNKS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort]}
                className="hidden shrink-0 items-center justify-center rounded-md border border-border-subtle bg-subtle/60 px-1.5 py-px font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground sm:inline-flex"
                title={CHUNKS_MESSAGES.EFFORT_TOOLTIPS[chunk.estimated_effort]}
              >
                {CHUNKS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort]}
              </span>
              <span className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground md:inline-flex">
                <FileText aria-hidden="true" className="h-3 w-3" />
                {CHUNKS_MESSAGES.CARD_FILES_LABEL(fileCount)}
              </span>
              <span className="hidden shrink-0 truncate text-[11px] text-muted-foreground md:inline lg:max-w-[140px]">
                {agentLabel}
              </span>
              <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-faint" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
