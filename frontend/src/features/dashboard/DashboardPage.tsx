import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { DashboardError } from '@/features/dashboard/DashboardError';
import { DashboardSkeleton } from '@/features/dashboard/DashboardSkeleton';
import { EmptyDashboard } from '@/features/dashboard/EmptyDashboard';
import { DASHBOARD_MESSAGES } from '@/features/dashboard/messages';
import { ProjectCard } from '@/features/dashboard/ProjectCard';
import { useProjects } from '@/features/dashboard/useProjects';
import { useDocumentTitle } from '@/lib/document-title';
import type { Project } from '@/types/project';

/**
 * Page-header pattern: mono eyebrow over a 28px title with a tight subtitle. The "+ New project"
 * CTA used to live on the right of this header, but it moved to the AppHeader topbar so the
 * primary action is reachable from every page in the workspace.
 */
function DashboardHeader() {
  return (
    <header className="mb-8">
      <p className="page-eyebrow">{DASHBOARD_MESSAGES.PAGE_EYEBROW}</p>
      <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight">
        {DASHBOARD_MESSAGES.PAGE_TITLE}
      </h1>
      <p className="mt-2 max-w-2xl text-[14px] text-muted-foreground">
        {DASHBOARD_MESSAGES.PAGE_SUBTITLE}
      </p>
    </header>
  );
}

/**
 * Plus-tile mirrors the design's "Start a new project" card. Sits first in the grid alongside
 * existing project cards so a returning user always has a fast path to create a new project.
 */
function NewProjectTile() {
  return (
    <Link
      className="group flex min-h-[208px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-card/40 p-8 text-center transition-colors hover:border-border-strong hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      to={ROUTES.PROJECT_NEW}
    >
      <span className="grid size-12 place-items-center rounded-lg bg-foreground text-background transition-transform group-hover:scale-105">
        <Plus aria-hidden="true" className="size-5" />
      </span>
      <span className="text-[14px] font-semibold tracking-tight">
        {DASHBOARD_MESSAGES.NEW_PROJECT_TILE_TITLE}
      </span>
      <span className="text-[12px] text-muted-foreground">
        {DASHBOARD_MESSAGES.NEW_PROJECT_TILE_BODY}
      </span>
    </Link>
  );
}

function ProjectGrid({ projects }: { projects: readonly Project[] }) {
  // The 3-column layout previously kicked in at `lg` (1024px viewport), which left only ~760px
  // of content width after the 240px sidebar and the AppShell padding. Three cards in that space
  // ran tight and (at slightly narrower viewports) appeared to overflow horizontally. Bumping the
  // 3-column breakpoint to `xl` (1280px) gives each card ~340px of room, matching the design's
  // intended density and removing the clipping the user reported.
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <NewProjectTile />
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  );
}

export function DashboardPage() {
  useDocumentTitle('Dashboard — buildmap');
  const { data, isPending, isError, refetch } = useProjects();

  // AppShell no longer caps width globally — Dashboard opts into the legacy ~6xl reading width.
  return (
    <div className="mx-auto max-w-6xl">
      <DashboardHeader />
      {isPending && <DashboardSkeleton />}
      {isError && <DashboardError onRetry={() => void refetch()} />}
      {!isPending && !isError && data && data.length === 0 && <EmptyDashboard />}
      {!isPending && !isError && data && data.length > 0 && <ProjectGrid projects={data} />}
    </div>
  );
}
