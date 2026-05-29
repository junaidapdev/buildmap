import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import type { ChunkStatus } from '@shared/schemas/chunks';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// Maps the six canonical statuses onto the available badge variants. Status is always communicated
// by its text label too, so meaning never depends on color alone. Distinct per-status color tokens
// arrive with the board (a later chunk); this basic list reuses the shared variants.
const STATUS_BADGE_VARIANT: Record<ChunkStatus, BadgeVariant> = {
  backlog: 'outline',
  ready: 'secondary',
  in_progress: 'default',
  needs_review: 'secondary',
  completed: 'secondary',
  blocked: 'destructive',
};

type ReferenceItem = { key: string; label: string; known: boolean };

function ReferenceRow({ label, items }: { label: string; items: ReferenceItem[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}:</span>
      {items.map((item) => (
        <Badge
          className={item.known ? undefined : 'text-muted-foreground'}
          key={item.key}
          variant={item.known ? 'secondary' : 'outline'}
        >
          {item.label}
        </Badge>
      ))}
    </div>
  );
}

type ChunkListItemProps = {
  chunk: ChunkRow;
  /** PRD feature id -> feature name, for rendering included_features as names. */
  prdFeatures: Map<string, string>;
  /** Chunk ref -> chunk, for rendering dependencies as sibling chunk titles. */
  chunksByRef: Map<string, ChunkRow>;
};

export function ChunkListItem({ chunk, prdFeatures, chunksByRef }: ChunkListItemProps) {
  const featureItems: ReferenceItem[] = chunk.included_features.map((id) => {
    const name = prdFeatures.get(id);
    return { key: id, label: name ?? CHUNKS_MESSAGES.UNKNOWN_REFERENCE(id), known: Boolean(name) };
  });

  const dependencyItems: ReferenceItem[] = chunk.dependencies.map((ref) => {
    const dependency = chunksByRef.get(ref);
    return {
      key: ref,
      label: dependency?.title ?? CHUNKS_MESSAGES.UNKNOWN_REFERENCE(ref),
      known: Boolean(dependency),
    };
  });

  return (
    <li className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-baseline gap-2">
          <span aria-hidden="true" className="text-xs font-medium text-muted-foreground">
            {chunk.position + 1}
          </span>
          <h3 className="font-semibold leading-snug">{chunk.title}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={STATUS_BADGE_VARIANT[chunk.status]}>
            {CHUNKS_MESSAGES.STATUS_LABELS[chunk.status]}
          </Badge>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                aria-label={CHUNKS_MESSAGES.EFFORT_TOOLTIPS[chunk.estimated_effort]}
                className="cursor-default font-mono uppercase"
                tabIndex={0}
                variant="outline"
              >
                {CHUNKS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort]}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              {CHUNKS_MESSAGES.EFFORT_TOOLTIPS[chunk.estimated_effort]}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{chunk.description}</p>

      {featureItems.length > 0 && (
        <ReferenceRow items={featureItems} label={CHUNKS_MESSAGES.INCLUDED_FEATURES_LABEL} />
      )}
      {dependencyItems.length > 0 && (
        <ReferenceRow items={dependencyItems} label={CHUNKS_MESSAGES.DEPENDENCIES_LABEL} />
      )}
    </li>
  );
}
