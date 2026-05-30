import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { countChunksByStatus } from '@/features/projects/progress/countByStatus';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';
import { ProjectStatusBadge } from '@/features/projects/progress/ProjectStatusBadge';
import type { ProjectStatus } from '@/types/project';

type ProgressOverviewCardProps = {
  projectStatus: ProjectStatus;
  chunks: ChunkRow[];
};

type StatProps = {
  label: string;
  value: number;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <div className="text-[28px] font-semibold leading-[1.1] tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function ProgressOverviewCard({ projectStatus, chunks }: ProgressOverviewCardProps) {
  const counts = useMemo(() => countChunksByStatus(chunks), [chunks]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{PROGRESS_MESSAGES.OVERVIEW_TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-2 text-sm">
          <span className="text-muted-foreground">{PROGRESS_MESSAGES.PROJECT_STATUS_LABEL}:</span>
          <ProjectStatusBadge status={projectStatus} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          <Stat label={PROGRESS_MESSAGES.STAT_TOTAL} value={chunks.length} />
          <Stat label={PROGRESS_MESSAGES.STAT_COMPLETED} value={counts.completed} />
          <Stat label={PROGRESS_MESSAGES.STAT_IN_PROGRESS} value={counts.in_progress} />
          <Stat label={PROGRESS_MESSAGES.STAT_NEEDS_REVIEW} value={counts.needs_review} />
          <Stat label={PROGRESS_MESSAGES.STAT_READY} value={counts.ready} />
          <Stat label={PROGRESS_MESSAGES.STAT_BACKLOG} value={counts.backlog} />
          <Stat label={PROGRESS_MESSAGES.STAT_BLOCKED} value={counts.blocked} />
        </div>
      </CardContent>
    </Card>
  );
}
