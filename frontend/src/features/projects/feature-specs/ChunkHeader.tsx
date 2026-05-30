import { useMemo } from 'react';

import type { ChunkStatus } from '@shared/schemas/chunks';
import { Badge } from '@/components/ui/badge';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import { useChunks, type ChunkRow } from '@/features/projects/chunks/useChunks';
import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// Same mapping the board card uses; the status is always shown as a text label too, so meaning never
// rests on color alone.
const STATUS_BADGE_VARIANT: Record<ChunkStatus, BadgeVariant> = {
  backlog: 'outline',
  ready: 'secondary',
  in_progress: 'default',
  needs_review: 'secondary',
  completed: 'secondary',
  blocked: 'destructive',
};

type ChunkHeaderProps = {
  chunk: ChunkRow;
  projectId: string;
};

export function ChunkHeader({ chunk, projectId }: ChunkHeaderProps) {
  const prd = useExistingPrd(projectId);
  const chunksQuery = useChunks(projectId);

  // Resolve included PRD feature ids to names; fall back to the raw id until the PRD loads.
  const featureNames = useMemo(() => {
    const map = new Map((prd.data?.content_json.features ?? []).map((f) => [f.id, f.name]));
    return chunk.included_features.map((id) => map.get(id) ?? id);
  }, [prd.data, chunk.included_features]);

  // Resolve dependency refs to sibling chunk titles; fall back to the raw ref until chunks load.
  const dependencyTitles = useMemo(() => {
    const map = new Map(
      (chunksQuery.data ?? [])
        .filter((c) => c.ref !== null)
        .map((c) => [c.ref as string, c.title]),
    );
    return chunk.dependencies.map((ref) => map.get(ref) ?? ref);
  }, [chunksQuery.data, chunk.dependencies]);

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold">{chunk.title}</h1>
        <Badge variant={STATUS_BADGE_VARIANT[chunk.status]}>
          {CHUNKS_MESSAGES.STATUS_LABELS[chunk.status]}
        </Badge>
        <Badge className="font-mono uppercase" variant="outline">
          {CHUNKS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort]}
        </Badge>
      </div>
      <p className="text-muted-foreground">{chunk.description}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
        <span>
          <span className="font-medium">{FEATURE_SPEC_MESSAGES.CHUNK_HEADER_INCLUDES}:</span>{' '}
          {featureNames.length > 0
            ? featureNames.join(', ')
            : FEATURE_SPEC_MESSAGES.CHUNK_HEADER_EMPTY}
        </span>
        <span>
          <span className="font-medium">{FEATURE_SPEC_MESSAGES.CHUNK_HEADER_DEPENDS}:</span>{' '}
          {dependencyTitles.length > 0
            ? dependencyTitles.join(', ')
            : FEATURE_SPEC_MESSAGES.CHUNK_HEADER_EMPTY}
        </span>
      </div>
    </header>
  );
}
