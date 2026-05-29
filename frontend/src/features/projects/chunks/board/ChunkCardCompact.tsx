import { Link2, ListChecks } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import type { ChunkStatus } from '@shared/schemas/chunks';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// Maps the six canonical statuses onto badge variants. The status is always shown as a text label
// too, so meaning never rests on color alone.
const STATUS_BADGE_VARIANT: Record<ChunkStatus, BadgeVariant> = {
  backlog: 'outline',
  ready: 'secondary',
  in_progress: 'default',
  needs_review: 'secondary',
  completed: 'secondary',
  blocked: 'destructive',
};

type ChunkCardCompactProps = {
  chunk: ChunkRow;
};

/**
 * Pure visual presentation of a chunk card — no drag, status, or navigation concerns. Rendered both
 * inside the live sortable card and (identically) inside the drag overlay, so the dragged ghost
 * matches the card it came from.
 */
export function ChunkCardCompact({ chunk }: ChunkCardCompactProps) {
  const featureCount = chunk.included_features.length;
  const dependencyCount = chunk.dependencies.length;

  return (
    <div className="min-w-0">
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{chunk.title}</h3>
        <Badge className="shrink-0 font-mono uppercase" variant="outline">
          {CHUNKS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort]}
        </Badge>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant={STATUS_BADGE_VARIANT[chunk.status]}>
          {CHUNKS_MESSAGES.STATUS_LABELS[chunk.status]}
        </Badge>
        {featureCount > 0 && (
          <span
            className="flex items-center gap-1 text-xs text-muted-foreground"
            title={CHUNKS_MESSAGES.INCLUDED_FEATURES_LABEL}
          >
            <ListChecks aria-hidden="true" className="h-3.5 w-3.5" />
            {featureCount}
          </span>
        )}
        {dependencyCount > 0 && (
          <span
            className="flex items-center gap-1 text-xs text-muted-foreground"
            title={CHUNKS_MESSAGES.DEPENDENCIES_LABEL}
          >
            <Link2 aria-hidden="true" className="h-3.5 w-3.5" />
            {dependencyCount}
          </span>
        )}
      </div>
    </div>
  );
}
