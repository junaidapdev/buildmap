import { Link } from 'react-router-dom';

import type { ChunkStatus } from '@shared/schemas/chunks';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/constants/routes';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';

type ProgressByStatusSectionProps = {
  status: ChunkStatus;
  chunks: ChunkRow[];
  projectId: string;
};

/**
 * Renders one status group as a tappable list of chunks (linking to the chunk detail page). Caller
 * pre-filters by status; this component owns the ordering (position ascending). Returns null when
 * the group is empty so empty sections never appear on the progress page.
 */
export function ProgressByStatusSection({
  status,
  chunks,
  projectId,
}: ProgressByStatusSectionProps) {
  if (chunks.length === 0) {
    return null;
  }
  const sorted = [...chunks].sort((a, b) => a.position - b.position);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">
          {PROGRESS_MESSAGES.STATUS_SECTION_LABELS[status]}
        </h2>
        <Badge variant="outline">{sorted.length}</Badge>
      </div>
      <ul className="space-y-2">
        {sorted.map((chunk) => (
          <li key={chunk.id}>
            <Link
              className="flex items-start gap-3 rounded-md border p-3 transition-colors hover:bg-muted/50"
              to={ROUTES.PROJECT_CHUNK(projectId, chunk.id)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="truncate font-medium">{chunk.title}</span>
                  <Badge className="font-mono uppercase" variant="secondary">
                    {PROGRESS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort]}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{chunk.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
