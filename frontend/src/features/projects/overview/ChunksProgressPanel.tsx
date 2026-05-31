import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { EmptyPanelContent } from '@/features/projects/overview/EmptyPanelContent';
import { KanbanSquare } from '@/features/projects/overview/icons';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { PanelCard } from '@/features/projects/overview/PanelCard';
import { useChunksState } from '@/features/projects/overview/stubs/useChunksState';
import { cn } from '@/lib/utils';

/** Compact mono stat — label on top, large tabular numeral on the bottom. */
function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-md border border-border-subtle bg-subtle/40 px-3 py-2.5">
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 font-mono text-[20px] font-semibold leading-none tabular-nums',
          accent ? 'text-brand-text' : 'text-foreground',
        )}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Real chunk progress panel. Replaces the original TODO body so this section is no longer
 * visually empty for projects that have chunks. Three stat cells (Total / Completed / In
 * progress) + a brand-soft progress bar showing % completed; the right-aligned "Open board"
 * link deep-links into the Kanban.
 */
export function ChunksProgressPanel({ projectId }: { projectId: string }) {
  const { data } = useChunksState(projectId);
  const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;

  return (
    <PanelCard
      action={
        data.exists ? (
          <Link
            className="text-sm text-muted-foreground hover:text-foreground"
            to={ROUTES.PROJECT_CHUNKS(projectId)}
          >
            {OVERVIEW_MESSAGES.CHUNKS_OPEN_BOARD_LINK}
          </Link>
        ) : undefined
      }
      icon={<KanbanSquare aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={OVERVIEW_MESSAGES.CHUNKS_TITLE}
    >
      {!data.exists ? (
        <EmptyPanelContent
          body={OVERVIEW_MESSAGES.CHUNKS_EMPTY_BODY}
          title={OVERVIEW_MESSAGES.CHUNKS_EMPTY_TITLE}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <Stat label={OVERVIEW_MESSAGES.CHUNKS_TOTAL_LABEL} value={data.total} />
            <Stat
              accent={data.completed > 0}
              label={OVERVIEW_MESSAGES.CHUNKS_DONE_LABEL}
              value={data.completed}
            />
            <Stat label={OVERVIEW_MESSAGES.CHUNKS_IN_PROGRESS_LABEL} value={data.inProgress} />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">{OVERVIEW_MESSAGES.CHUNKS_PROGRESS_LABEL}</span>
              <span className="font-mono tabular-nums text-foreground">{percent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-subtle">
              <div
                aria-hidden="true"
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </PanelCard>
  );
}
