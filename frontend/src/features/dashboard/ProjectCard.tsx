import { Link } from 'react-router-dom';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ROUTES } from '@/constants/routes';
import { DASHBOARD_MESSAGES } from '@/features/dashboard/messages';
import { ProjectStatusBadge } from '@/features/dashboard/ProjectStatusBadge';
import { formatRelativeTime } from '@/lib/relative-time';
import type { Project } from '@/types/project';

type ProjectCardProps = {
  project: Project;
};

type PlaceholderStatProps = {
  label: string;
  activationChunk: number;
};

const PLACEHOLDER_STATS: readonly PlaceholderStatProps[] = [
  { label: DASHBOARD_MESSAGES.CARD_CHUNK_COUNT_LABEL, activationChunk: 18 },
  { label: DASHBOARD_MESSAGES.CARD_COMPLETION_LABEL, activationChunk: 22 },
  { label: DASHBOARD_MESSAGES.CARD_OPEN_ISSUES_LABEL, activationChunk: 23 },
] as const;

function PlaceholderStat({ label, activationChunk }: PlaceholderStatProps) {
  return (
    <div className="space-y-0.5 text-center">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-label={DASHBOARD_MESSAGES.CARD_PLACEHOLDER_ACCESSIBLE_LABEL(label, activationChunk)}
            className="pointer-events-auto relative z-20 inline-flex cursor-help rounded text-[15px] font-semibold tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            type="button"
          >
            {DASHBOARD_MESSAGES.CARD_PLACEHOLDER_VALUE}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {DASHBOARD_MESSAGES.CARD_PLACEHOLDER_TOOLTIP(activationChunk)}
        </TooltipContent>
      </Tooltip>
      <p className="text-[11px] text-faint">{label}</p>
    </div>
  );
}

/**
 * Project card. The whole card is a click target via the absolutely positioned overlay link, but
 * the inner stat row uses pointer-events-auto so its tooltips fire correctly. The redesigned
 * card moves the status badge above the title (smaller), uses tabular-nums on the stat values,
 * and keeps the footer-style updated stamp in the top-right next to the badge so the bottom row
 * can be devoted entirely to the stat grid.
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group relative flex h-full min-h-[208px] flex-col rounded-xl border bg-card p-5 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-soft">
      <Link
        aria-label={project.name}
        className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        to={ROUTES.PROJECT_OVERVIEW(project.id)}
      />
      <div className="pointer-events-none relative flex flex-1 flex-col">
        <div className="mb-3 flex items-start justify-between gap-3">
          <ProjectStatusBadge status={project.status} />
          <span className="font-mono text-[11px] text-faint">
            {DASHBOARD_MESSAGES.CARD_LAST_UPDATED_PREFIX}{' '}
            {formatRelativeTime(project.updated_at, DASHBOARD_MESSAGES.CARD_UPDATED_JUST_NOW)}
          </span>
        </div>
        <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug tracking-tight">
          {project.name}
        </h3>
        {project.description && (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">
            {project.description}
          </p>
        )}
        <div className="mt-auto pt-5">
          <div className="grid grid-cols-3 divide-x rounded-lg border bg-subtle py-3">
            {PLACEHOLDER_STATS.map((stat) => (
              <PlaceholderStat
                activationChunk={stat.activationChunk}
                key={stat.label}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
