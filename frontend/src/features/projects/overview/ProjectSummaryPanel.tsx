import { ProjectStatusBadge } from '@/features/dashboard/ProjectStatusBadge';
import { useProject } from '@/features/projects/layout/useProject';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { formatRelativeTime } from '@/lib/relative-time';

/**
 * Project page header. Mono eyebrow "PROJECT" + 28px title + description + small meta row with
 * updated/created times and the status badge top-right. Matches the page-header pattern used on
 * the dashboard and the per-project detail pages.
 */
export function ProjectSummaryPanel() {
  const { project } = useProject();

  return (
    <header className="border-b border-border-subtle pb-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="page-eyebrow">PROJECT</p>
          <h1 className="text-balance text-[28px] font-semibold leading-[1.1] tracking-tight">
            {project.name}
          </h1>
          <p className="max-w-2xl text-[14px] text-muted-foreground">
            {project.description ?? OVERVIEW_MESSAGES.SUMMARY_NO_DESCRIPTION}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-faint">
        <span>
          {OVERVIEW_MESSAGES.SUMMARY_LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(project.updated_at, OVERVIEW_MESSAGES.SUMMARY_JUST_NOW)}
        </span>
        <span>
          {OVERVIEW_MESSAGES.SUMMARY_CREATED_PREFIX}{' '}
          {formatRelativeTime(project.created_at, OVERVIEW_MESSAGES.SUMMARY_JUST_NOW)}
        </span>
      </div>
    </header>
  );
}
