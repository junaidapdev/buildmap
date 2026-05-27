import { useProject } from '@/features/projects/layout/useProject';
import { BriefStatusPanel } from '@/features/projects/overview/BriefStatusPanel';
import { ChunksProgressPanel } from '@/features/projects/overview/ChunksProgressPanel';
import { ExportShortcutPanel } from '@/features/projects/overview/ExportShortcutPanel';
import { NextActionPanel } from '@/features/projects/overview/NextActionPanel';
import { OpenIssuesPanel } from '@/features/projects/overview/OpenIssuesPanel';
import { ProjectSummaryPanel } from '@/features/projects/overview/ProjectSummaryPanel';
import { RecentDecisionsPanel } from '@/features/projects/overview/RecentDecisionsPanel';

export function OverviewPage() {
  const { project } = useProject();

  return (
    <div className="space-y-6">
      <ProjectSummaryPanel />
      <NextActionPanel projectId={project.id} />
      <ChunksProgressPanel projectId={project.id} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BriefStatusPanel projectId={project.id} />
        <OpenIssuesPanel projectId={project.id} />
        <RecentDecisionsPanel projectId={project.id} />
        <ExportShortcutPanel />
      </div>
    </div>
  );
}
