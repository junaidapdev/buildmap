import { NavLink } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { PROJECT_STATUS_CONFIG } from '@/features/dashboard/status-config';
import { useProjects } from '@/features/dashboard/useProjects';
import { cn } from '@/lib/utils';

/** Number of most-recently-updated projects to surface in the sidebar. */
const RECENT_LIMIT = 5;

type SidebarRecentProjectsProps = {
  /** Closes the mobile nav sheet on click. */
  onNavigate?: () => void;
};

/**
 * Renders the "RECENT" project group inside the sidebar. Reads from the same `useProjects()` query
 * the dashboard uses (TanStack Query dedupes the fetch, so visiting the dashboard after the
 * sidebar loads — or vice versa — hits the cache). Each row links to that project's overview and
 * is highlighted when the URL is inside the project.
 *
 * Renders nothing when:
 *   - the query is loading, errored, or empty (the section should never appear half-baked);
 *   - the sidebar is collapsed (icons-only mode has no room for a 5-row list of names).
 *
 * The dot color comes from the same `PROJECT_STATUS_CONFIG` map the project badge uses, so the
 * sidebar reads as a tiny status indicator: amber dot = building, green = completed, etc.
 */
export function SidebarRecentProjects({ onNavigate }: SidebarRecentProjectsProps) {
  const { data, isPending, isError } = useProjects();

  if (isPending || isError) {
    return null;
  }

  const recent = (data ?? []).slice(0, RECENT_LIMIT);

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
        Recent
      </p>
      <ul className="space-y-0.5">
        {recent.map((project) => {
          const config = PROJECT_STATUS_CONFIG[project.status];
          return (
            <li key={project.id}>
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'group flex h-[30px] items-center gap-[9px] rounded-md px-2 text-[13px] text-secondaryText transition-colors',
                    'hover:bg-hover hover:text-foreground',
                    isActive && 'bg-inset font-medium text-foreground',
                  )
                }
                onClick={onNavigate}
                to={ROUTES.PROJECT_OVERVIEW(project.id)}
                // `end={false}` so any /projects/:id/* subroute keeps this row active.
              >
                <span
                  aria-hidden="true"
                  className={cn('size-2 shrink-0 rounded-full', config.dotClass)}
                />
                <span className="truncate">{project.name}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
