import { ProjectStatusBadge } from '@/features/dashboard/ProjectStatusBadge';
import { useProject } from '@/features/projects/layout/useProject';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import { formatRelativeTime } from '@/lib/relative-time';
import type { Project } from '@/types/project';

/**
 * Eyebrow text. Defaults to "PROJECT"; appended with the project_type when one is set so the
 * header reads like the design's "PROJECT · MOBILE + WEB". Returns just "PROJECT" when no type
 * has been chosen.
 */
const PROJECT_TYPE_LABELS: Record<NonNullable<Project['project_type']>, string> = {
  side_project: 'SIDE PROJECT',
  company: 'COMPANY',
  client: 'CLIENT',
  saas: 'SAAS',
  other: 'OTHER',
};

/**
 * Project page header. Editorial layout — mono eyebrow ("PROJECT · SAAS"), 28px title, subtitle
 * description, status badge top-right. The status pill sits in the top-right of the eyebrow row
 * so it doesn't compete with the title; the meta row (Updated/Created) anchors the bottom and
 * stays small.
 */
export function ProjectSummaryPanel() {
  const { project } = useProject();

  const eyebrow = project.project_type
    ? `PROJECT · ${PROJECT_TYPE_LABELS[project.project_type]}`
    : 'PROJECT';

  return (
    <header className="border-b border-border-subtle pb-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <p className="page-eyebrow">{eyebrow}</p>
          <h1 className="text-balance text-[28px] font-semibold leading-[1.1] tracking-tight">
            {project.name}
          </h1>
          <p className="max-w-2xl text-[14px] text-muted-foreground">
            {project.description ?? OVERVIEW_MESSAGES.SUMMARY_NO_DESCRIPTION}
          </p>
        </div>
        <ProjectStatusBadge status={project.status} />
      </div>
      <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-faint">
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
