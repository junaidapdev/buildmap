import { useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { useMemo } from 'react';

import type { ChunkStatus } from '@shared/schemas/chunks';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CHUNK_STATUS_ORDER } from '@/features/projects/chunks/board/columns';
import { useMoveChunk } from '@/features/projects/chunks/board/useMoveChunk';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import { chunkQueryKey } from '@/features/projects/feature-specs/useChunk';
import { useChunks, type ChunkRow } from '@/features/projects/chunks/useChunks';
import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';
import { useProject } from '@/features/projects/layout/useProject';
import { useExistingPrd } from '@/features/projects/prd/useExistingPrd';
import { cn } from '@/lib/utils';

type ChunkHeaderProps = {
  chunk: ChunkRow;
  projectId: string;
  /** Invoked by the "View prompt" button — parent switches the Tabs value to "prompt". */
  onViewPrompt: () => void;
};

/**
 * Detail-page header that mirrors the Lumen mockup:
 *   - Pill cluster row: `#N` + status pill + effort pill + file count + agent label.
 *   - 28px title + muted description.
 *   - Right side: status dropdown (live status change via move_chunk with current position) + a
 *     primary "View prompt" button that snaps the parent tab to the Prompt panel.
 *
 * Includes / Depends-on info moves into the pill row's secondary line below so the editorial
 * rhythm doesn't get cluttered.
 */
export function ChunkHeader({ chunk, projectId, onViewPrompt }: ChunkHeaderProps) {
  const { project } = useProject();
  const prd = useExistingPrd(projectId);
  const chunksQuery = useChunks(projectId);
  const move = useMoveChunk(projectId);
  const queryClient = useQueryClient();

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

  const number = chunk.position + 1;
  const fileCount = chunk.included_features.length;
  const agentLabel = project.preferred_agent
    ? FEATURE_SPEC_MESSAGES.CARD_AGENT_LABELS[project.preferred_agent]
    : FEATURE_SPEC_MESSAGES.CARD_AGENT_FALLBACK;
  const isBlocked = chunk.status === 'blocked';
  const isInProgress = chunk.status === 'in_progress';

  function handleStatusChange(nextStatus: ChunkStatus): void {
    if (nextStatus === chunk.status) return;
    move.mutate(
      {
        chunkId: chunk.id,
        newStatus: nextStatus,
        newPosition: chunk.position,
      },
      {
        // useMoveChunk's onSettled invalidates the `chunks` list cache; the single-chunk query
        // used by this page lives at a different key, so we invalidate it explicitly here.
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: chunkQueryKey(chunk.id) });
        },
      },
    );
  }

  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-[12px]">
        <span className="font-mono text-muted-foreground">#{number}</span>
        <StatusChip status={chunk.status} />
        <Pill>
          {FEATURE_SPEC_MESSAGES.CARD_EFFORT_LABEL(CHUNKS_MESSAGES.EFFORT_LABELS[chunk.estimated_effort])}
        </Pill>
        <Pill>
          <FileText aria-hidden="true" className="h-3 w-3" />
          {FEATURE_SPEC_MESSAGES.CARD_FILES_LABEL(fileCount)}
        </Pill>
        <Pill>{agentLabel}</Pill>
        {isInProgress && (
          <span aria-hidden="true" className="size-1.5 rounded-full bg-status-done-fg" />
        )}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <h1 className="text-balance text-[28px] font-semibold leading-[1.1] tracking-tight">
            {chunk.title}
          </h1>
          {chunk.description && (
            <p className="max-w-3xl text-[14px] text-muted-foreground">{chunk.description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Select onValueChange={(value) => handleStatusChange(value as ChunkStatus)} value={chunk.status}>
            <SelectTrigger aria-label={FEATURE_SPEC_MESSAGES.STATUS_SELECT_LABEL} className="h-9 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CHUNK_STATUS_ORDER.map((status) => (
                <SelectItem key={status} value={status}>
                  {CHUNKS_MESSAGES.STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onViewPrompt} size="sm" variant="outline">
            {FEATURE_SPEC_MESSAGES.VIEW_PROMPT_BUTTON}
          </Button>
        </div>
      </div>

      {(featureNames.length > 0 || dependencyTitles.length > 0) && (
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-muted-foreground">
          {featureNames.length > 0 && (
            <span>
              <span className="font-medium text-foreground">
                {FEATURE_SPEC_MESSAGES.CHUNK_HEADER_INCLUDES}:
              </span>{' '}
              {featureNames.join(', ')}
            </span>
          )}
          {dependencyTitles.length > 0 && (
            <span>
              <span className="font-medium text-foreground">
                {FEATURE_SPEC_MESSAGES.CHUNK_HEADER_DEPENDS}:
              </span>{' '}
              {dependencyTitles.join(', ')}
            </span>
          )}
        </div>
      )}

      {isBlocked && (
        <p className="flex items-start gap-2 rounded-md border border-status-blocked-border bg-status-blocked-bg px-3 py-2 text-[12px] leading-snug text-status-blocked-fg">
          <span aria-hidden="true">⚠</span>
          <span>{CHUNKS_MESSAGES.CARD_BLOCKED_HINT}</span>
        </p>
      )}
    </header>
  );
}

/** Generic mono uppercase pill used across the header's secondary row. */
function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-subtle/60 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}

/** Status-colored pill matching the column header dot palette. */
function StatusChip({ status }: { status: ChunkStatus }) {
  const className = STATUS_CHIP_CLASS[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
        className,
      )}
    >
      {CHUNKS_MESSAGES.STATUS_LABELS[status]}
    </span>
  );
}

const STATUS_CHIP_CLASS: Record<ChunkStatus, string> = {
  backlog: 'border-status-backlog-border bg-status-backlog-bg text-status-backlog-fg',
  ready: 'border-status-review-border bg-status-review-bg text-status-review-fg',
  in_progress: 'border-status-progress-border bg-status-progress-bg text-status-progress-fg',
  needs_review: 'border-status-review-border bg-status-review-bg text-status-review-fg',
  completed: 'border-status-done-border bg-status-done-bg text-status-done-fg',
  blocked: 'border-status-blocked-border bg-status-blocked-bg text-status-blocked-fg',
};
