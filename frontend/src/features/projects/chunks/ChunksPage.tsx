import { CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChunkBoard } from '@/features/projects/chunks/board/ChunkBoard';
import { ChunkList } from '@/features/projects/chunks/ChunkList';
import { ChunksError } from '@/features/projects/chunks/ChunksError';
import { ChunksGatingState } from '@/features/projects/chunks/ChunksGatingState';
import { ChunksPageActions } from '@/features/projects/chunks/ChunksPageActions';
import { ChunksPending } from '@/features/projects/chunks/ChunksPending';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';
import type { ChunkRow } from '@/features/projects/chunks/useChunks';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { useGenerateChunks } from '@/features/projects/chunks/useGenerateChunks';
import { useProject } from '@/features/projects/layout/useProject';
import { useContextFilesState } from '@/features/projects/overview/stubs/useContextFilesState';
import { useDocumentTitle } from '@/lib/document-title';

export type ChunksView = 'board' | 'list';

function computeStats(chunks: ChunkRow[]) {
  let done = 0;
  let inProgress = 0;
  let backlog = 0;
  let blocked = 0;
  for (const chunk of chunks) {
    if (chunk.status === 'completed') done += 1;
    else if (chunk.status === 'in_progress') inProgress += 1;
    else if (chunk.status === 'backlog') backlog += 1;
    else if (chunk.status === 'blocked') blocked += 1;
  }
  const total = chunks.length;
  const shippedPct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, inProgress, backlog, blocked, shippedPct };
}

/**
 * Stats meta row that sits inside the page header on the Lumen mockup. Renders as a single line of
 * dot-separated count labels: "5 done · 2 in progress · 4 backlog · 1 blocked · 42% shipped". Each
 * count gets its tabular mono numerals via `font-mono tabular-nums` so the row stays aligned as
 * counts tick. The shipped percent is bolded slightly so the headline metric reads first.
 */
function ChunkStatsRow({ chunks }: { chunks: ChunkRow[] }) {
  const stats = useMemo(() => computeStats(chunks), [chunks]);
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
      <span className="font-mono tabular-nums">{CHUNKS_MESSAGES.STATS_DONE(stats.done)}</span>
      <span className="text-faint">·</span>
      <span className="font-mono tabular-nums">
        {CHUNKS_MESSAGES.STATS_IN_PROGRESS(stats.inProgress)}
      </span>
      <span className="text-faint">·</span>
      <span className="font-mono tabular-nums">{CHUNKS_MESSAGES.STATS_BACKLOG(stats.backlog)}</span>
      <span className="text-faint">·</span>
      <span className="font-mono tabular-nums">{CHUNKS_MESSAGES.STATS_BLOCKED(stats.blocked)}</span>
      <span className="text-faint">·</span>
      <span className="font-mono font-semibold tabular-nums text-foreground">
        {CHUNKS_MESSAGES.STATS_SHIPPED_PERCENT(stats.shippedPct)}
      </span>
    </p>
  );
}

export function ChunksPage() {
  // The layout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  useDocumentTitle(`Chunks — ${project.name || 'Project'} — buildmap`);
  const contextFiles = useContextFilesState(projectId);
  const chunksQuery = useChunks(projectId);
  const generate = useGenerateChunks(projectId);
  const generateChunks = generate.mutate;
  const startedForProjectRef = useRef<string | null>(null);

  // Board/List view toggle. Board is the default workspace; List is a flat read-only fallback.
  const [view, setView] = useState<ChunksView>('board');

  const chunks = chunksQuery.data ?? [];
  const chunksExist = chunks.length > 0;
  const contextFilesExist = contextFiles.data.exists;

  useEffect(() => {
    // Wait for both lookups; a failed read must not trigger generation.
    if (contextFiles.isPending || chunksQuery.isPending || chunksQuery.isError) {
      return;
    }
    // Chunks already exist (return visit): display them, never auto-regenerate.
    if (chunksExist) {
      return;
    }
    // Context files gate generation; the gating state handles this case.
    if (!contextFilesExist) {
      return;
    }
    // Track which project generation fired for: blocks StrictMode replay and still fires for a
    // different project opened in the same component instance.
    if (startedForProjectRef.current === projectId) {
      return;
    }

    startedForProjectRef.current = projectId;
    generateChunks();
  }, [
    contextFiles.isPending,
    chunksQuery.isPending,
    chunksQuery.isError,
    chunksExist,
    contextFilesExist,
    generateChunks,
    projectId,
  ]);

  // First-time generation advances project status; surface the transition once, when chunks exist.
  const showStatusAdvanced = generate.data?.statusAdvanced === true && chunksExist;

  let body: ReactNode;
  if (chunksQuery.isPending) {
    body = <ChunksPending />;
  } else if (chunksExist) {
    body =
      view === 'board' ? (
        <ChunkBoard chunks={chunks} projectId={projectId} />
      ) : (
        <ChunkList chunks={chunks} project={project} projectId={projectId} />
      );
  } else if (chunksQuery.isError) {
    body = <ChunksError error={chunksQuery.error} onRetry={() => void chunksQuery.refetch()} />;
  } else if (contextFiles.isPending) {
    body = <ChunksPending />;
  } else if (!contextFilesExist) {
    body = <ChunksGatingState projectId={projectId} />;
  } else if (generate.isError) {
    body = <ChunksError error={generate.error} onRetry={() => generateChunks()} />;
  } else {
    // Context files exist, no chunks yet: generation is idle or in flight.
    body = <ChunksPending />;
  }

  return (
    // Full width on purpose — the Kanban board needs every pixel between the sidebar and the
    // right edge. AppShell provides horizontal screen-edge padding; no extra max-width here.
    <div className="w-full">
      <header className="mb-6 border-b border-border-subtle pb-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="page-eyebrow">{CHUNKS_MESSAGES.PAGE_EYEBROW}</p>
            <h1 className="mt-2 text-[28px] font-semibold leading-[1.1] tracking-tight">
              {CHUNKS_MESSAGES.PAGE_TITLE}
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
              {CHUNKS_MESSAGES.PAGE_SUBTITLE}
            </p>
            {chunksExist && <ChunkStatsRow chunks={chunks} />}
          </div>
          {chunksExist && (
            <ChunksPageActions onViewChange={setView} projectId={projectId} view={view} />
          )}
        </div>
      </header>
      {showStatusAdvanced && (
        <Alert className="mb-6">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          <AlertTitle>{CHUNKS_MESSAGES.STATUS_ADVANCED_TITLE}</AlertTitle>
          <AlertDescription>{CHUNKS_MESSAGES.STATUS_ADVANCED_BODY}</AlertDescription>
        </Alert>
      )}
      {body}
    </div>
  );
}
