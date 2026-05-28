import { ProjectStatusBadge } from '@/features/dashboard/ProjectStatusBadge';
import { useProject } from '@/features/projects/layout/useProject';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { formatRelativeTime } from '@/lib/relative-time';

export function ProjectSummaryPanel() {
  const { project } = useProject();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <p className="text-muted-foreground">
            {project.description ?? OVERVIEW_MESSAGES.SUMMARY_NO_DESCRIPTION}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          {OVERVIEW_MESSAGES.SUMMARY_LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(project.updated_at, OVERVIEW_MESSAGES.SUMMARY_JUST_NOW)}
        </span>
        <span>
          {OVERVIEW_MESSAGES.SUMMARY_CREATED_PREFIX}{' '}
          {formatRelativeTime(project.created_at, OVERVIEW_MESSAGES.SUMMARY_JUST_NOW)}
        </span>
      </div>
    </div>
  );
}
