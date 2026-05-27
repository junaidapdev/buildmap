import { EmptyPanelContent } from '@/features/projects/overview/EmptyPanelContent';
import { KanbanSquare } from '@/features/projects/overview/icons';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { PanelCard } from '@/features/projects/overview/PanelCard';
import { useChunksState } from '@/features/projects/overview/stubs/useChunksState';

export function ChunksProgressPanel({ projectId }: { projectId: string }) {
  const { data } = useChunksState(projectId);

  return (
    <PanelCard
      icon={<KanbanSquare aria-hidden="true" className="h-4 w-4 text-muted-foreground" />}
      title={OVERVIEW_MESSAGES.CHUNKS_TITLE}
    >
      {!data.exists ? (
        <EmptyPanelContent
          body={OVERVIEW_MESSAGES.CHUNKS_EMPTY_BODY}
          title={OVERVIEW_MESSAGES.CHUNKS_EMPTY_TITLE}
        />
      ) : // TODO(chunk-18+): real chunk progress — Total / Completed / In progress stats, a
      // completed/total progress bar, and an "Open board" link to ROUTES.PROJECT_CHUNKS(projectId).
      null}
    </PanelCard>
  );
}
