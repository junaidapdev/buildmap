import { useProject } from '@/features/projects/layout/useProject';
import { BriefStatusPanel } from '@/features/projects/overview/BriefStatusPanel';
import { ChunksProgressPanel } from '@/features/projects/overview/ChunksProgressPanel';
import { ExportProjectCard } from '@/features/projects/export/ExportProjectCard';
import { NextActionPanel } from '@/features/projects/overview/NextActionPanel';
import { OpenIssuesPanel } from '@/features/projects/overview/OpenIssuesPanel';
import { ProjectSummaryPanel } from '@/features/projects/overview/ProjectSummaryPanel';
import { RecentDecisionsPanel } from '@/features/projects/overview/RecentDecisionsPanel';
import { RecentLearningsPanel } from '@/features/projects/overview/RecentLearningsPanel';
import { useDocumentTitle } from '@/lib/document-title';

export function OverviewPage() {
  const { project } = useProject();
  // ProjectLayout has already loaded the project, so project.name is defined; the empty-string
  // fallback only fires if a project somehow has no name yet.
  useDocumentTitle(`${project.name || 'Project'} — buildmap`);

  return (
    // AppShell no longer caps width globally — Overview opts into the legacy ~6xl reading width.
    <div className="mx-auto max-w-6xl space-y-6">
      <ProjectSummaryPanel />
      <NextActionPanel projectId={project.id} />
      <ChunksProgressPanel projectId={project.id} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BriefStatusPanel projectId={project.id} />
        <OpenIssuesPanel projectId={project.id} />
        <RecentDecisionsPanel projectId={project.id} />
        <RecentLearningsPanel projectId={project.id} />
        <ExportProjectCard projectId={project.id} projectName={project.name} />
      </div>
    </div>
  );
}
