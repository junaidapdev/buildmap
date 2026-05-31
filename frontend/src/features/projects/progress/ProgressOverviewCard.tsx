import { Compass } from 'lucide-react';
import { useMemo } from 'react';

import { countChunksByStatus } from '@/features/projects/progress/countByStatus';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';
import { ProjectStatusBadge } from '@/features/projects/progress/ProjectStatusBadge';
import { PanelCard } from '@/features/projects/overview/PanelCard';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/types/project';

type ProgressOverviewCardProps = {
  projectStatus: ProjectStatus;
  chunks: ChunkRow[];
};

type StatProps = {
  label: string;
  value: number;
  /** Highlight the cell in the brand-soft green tint (used for the Completed cell). */
  accent?: boolean;
};

/**
 * One stat cell — mono uppercase label + large tabular numeral. Matches the Stat cell used in
 * ChunksProgressPanel so the two surfaces feel like the same component.
 */
function Stat({ label, value, accent }: StatProps) {
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2.5 transition-colors',
        accent
          ? 'border-brand-soft-border bg-brand-soft/60'
          : 'border-border-subtle bg-subtle/40',
      )}
    >
      <div
        className={cn(
          'font-mono text-[24px] font-semibold leading-none tabular-nums',
          accent ? 'text-brand-text' : 'text-foreground',
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/**
 * Project-level rollup at the top of the Progress page. Re-skinned to use PanelCard chrome
 * (uppercase mono "OVERVIEW" eyebrow + subtle border) so it visually belongs with the rest of
 * the planning-doc suite. The project status badge moves into the PanelCard's action slot in
 * the header so it sits next to the eyebrow.
 */
export function ProgressOverviewCard({ projectStatus, chunks }: ProgressOverviewCardProps) {
  const counts = useMemo(() => countChunksByStatus(chunks), [chunks]);

  return (
    <PanelCard
      action={
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            {PROGRESS_MESSAGES.PROJECT_STATUS_LABEL}
          </span>
          <ProjectStatusBadge status={projectStatus} />
        </div>
      }
      icon={<Compass aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={PROGRESS_MESSAGES.OVERVIEW_TITLE}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Stat label={PROGRESS_MESSAGES.STAT_TOTAL} value={chunks.length} />
        <Stat
          accent={counts.completed > 0}
          label={PROGRESS_MESSAGES.STAT_COMPLETED}
          value={counts.completed}
        />
        <Stat label={PROGRESS_MESSAGES.STAT_IN_PROGRESS} value={counts.in_progress} />
        <Stat label={PROGRESS_MESSAGES.STAT_NEEDS_REVIEW} value={counts.needs_review} />
        <Stat label={PROGRESS_MESSAGES.STAT_READY} value={counts.ready} />
        <Stat label={PROGRESS_MESSAGES.STAT_BACKLOG} value={counts.backlog} />
        <Stat label={PROGRESS_MESSAGES.STAT_BLOCKED} value={counts.blocked} />
      </div>
    </PanelCard>
  );
}
