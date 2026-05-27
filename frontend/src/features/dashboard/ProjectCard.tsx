import { Link } from 'react-router-dom';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
    <div className="space-y-1 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={DASHBOARD_MESSAGES.CARD_PLACEHOLDER_ACCESSIBLE_LABEL(
              label,
              activationChunk,
            )}
            className="pointer-events-auto relative z-20 inline-flex cursor-help rounded-sm text-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {DASHBOARD_MESSAGES.CARD_PLACEHOLDER_VALUE}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {DASHBOARD_MESSAGES.CARD_PLACEHOLDER_TOOLTIP(activationChunk)}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group relative flex h-full flex-col transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-md">
      <Link
        to={ROUTES.PROJECT_OVERVIEW(project.id)}
        aria-label={project.name}
        className="absolute inset-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      <div className="pointer-events-none relative flex h-full flex-col">
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div className="min-w-0 space-y-2">
            <CardTitle className="text-lg leading-snug">
              <span className="line-clamp-2">{project.name}</span>
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2">{project.description}</CardDescription>
            )}
          </div>
          <ProjectStatusBadge status={project.status} />
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="grid grid-cols-3 divide-x rounded-md border bg-muted/30 py-3">
            {PLACEHOLDER_STATS.map((stat) => (
              <PlaceholderStat
                key={stat.label}
                label={stat.label}
                activationChunk={stat.activationChunk}
              />
            ))}
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          {DASHBOARD_MESSAGES.CARD_LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(project.updated_at, DASHBOARD_MESSAGES.CARD_UPDATED_JUST_NOW)}
        </CardFooter>
      </div>
    </Card>
  );
}
