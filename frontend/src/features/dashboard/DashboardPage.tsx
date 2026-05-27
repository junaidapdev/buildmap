import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { DashboardError } from '@/features/dashboard/DashboardError';
import { DashboardSkeleton } from '@/features/dashboard/DashboardSkeleton';
import { EmptyDashboard } from '@/features/dashboard/EmptyDashboard';
import { DASHBOARD_MESSAGES } from '@/features/dashboard/messages';
import { ProjectCard } from '@/features/dashboard/ProjectCard';
import { useProjects } from '@/features/dashboard/useProjects';
import type { Project } from '@/types/project';

function DashboardHeader() {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{DASHBOARD_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{DASHBOARD_MESSAGES.PAGE_SUBTITLE}</p>
      </div>
      <Button asChild className="shrink-0">
        <Link to={ROUTES.PROJECT_NEW}>{DASHBOARD_MESSAGES.NEW_PROJECT_BUTTON}</Link>
      </Button>
    </header>
  );
}

function ProjectGrid({ projects }: { projects: readonly Project[] }) {
  return (
    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}

export function DashboardPage() {
  const { data, isPending, isError, refetch } = useProjects();

  return (
    <div>
      <DashboardHeader />
      {isPending && <DashboardSkeleton />}
      {isError && <DashboardError onRetry={() => void refetch()} />}
      {!isPending && !isError && data && data.length === 0 && <EmptyDashboard />}
      {!isPending && !isError && data && data.length > 0 && <ProjectGrid projects={data} />}
    </div>
  );
}
