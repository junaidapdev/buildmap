import type { ReactNode } from 'react';

import type { ChunkStatus } from '@shared/schemas/chunks';
import { useChunks } from '@/features/projects/chunks/useChunks';
import { useProject } from '@/features/projects/layout/useProject';
import { useDocumentTitle } from '@/lib/document-title';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';
import { ProgressByStatusSection } from '@/features/projects/progress/ProgressByStatusSection';
import { ProgressEmpty } from '@/features/projects/progress/ProgressEmpty';
import { ProgressError } from '@/features/projects/progress/ProgressError';
import { ProgressOverviewCard } from '@/features/projects/progress/ProgressOverviewCard';
import { ProgressPending } from '@/features/projects/progress/ProgressPending';
import { RecentActivityTimeline } from '@/features/projects/progress/RecentActivityTimeline';
import { SyncToMarkdownButton } from '@/features/projects/progress/SyncToMarkdownButton';

// Same priority order as the markdown renderer — actionable groups first, finished work last.
const SECTION_ORDER: readonly ChunkStatus[] = [
  'in_progress',
  'needs_review',
  'blocked',
  'ready',
  'backlog',
  'completed',
];

export function ProgressPage() {
  // ProjectLayout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  useDocumentTitle(`Progress — ${project.name || 'Project'} — buildmap`);
  const chunksQuery = useChunks(projectId);

  let body: ReactNode;

  if (chunksQuery.isPending) {
    body = <ProgressPending />;
  } else if (chunksQuery.isError) {
    body = <ProgressError onRetry={() => void chunksQuery.refetch()} />;
  } else {
    const chunks = chunksQuery.data ?? [];

    if (chunks.length === 0) {
      body = <ProgressEmpty projectId={projectId} />;
    } else {
      body = (
        <div className="space-y-6">
          <ProgressOverviewCard chunks={chunks} projectStatus={project.status} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {SECTION_ORDER.map((status) => (
                <ProgressByStatusSection
                  chunks={chunks.filter((chunk) => chunk.status === status)}
                  key={status}
                  projectId={projectId}
                  status={status}
                />
              ))}
            </div>
            <div>
              <RecentActivityTimeline chunks={chunks} projectId={projectId} />
            </div>
          </div>
        </div>
      );
    }
  }

  const hasChunks = (chunksQuery.data ?? []).length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight">{PROGRESS_MESSAGES.PAGE_TITLE}</h1>
          <p className="mt-2 text-muted-foreground">{PROGRESS_MESSAGES.PAGE_SUBTITLE}</p>
        </div>
        {hasChunks && (
          <SyncToMarkdownButton
            chunks={chunksQuery.data ?? []}
            project={{ name: project.name, status: project.status }}
            projectId={projectId}
          />
        )}
      </header>
      {body}
    </div>
  );
}
