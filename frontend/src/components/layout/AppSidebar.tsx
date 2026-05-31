import { Link, useParams } from 'react-router-dom';

import { BrandMark } from '@/components/layout/BrandMark';
import { GLOBAL_NAV, PROJECT_BACK_NAV, PROJECT_NAV } from '@/components/layout/nav-config';
import { SidebarNavItem } from '@/components/layout/SidebarNavItem';
import { SidebarRecentProjects } from '@/components/layout/SidebarRecentProjects';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

type AppSidebarProps = {
  mobile?: boolean;
  onNavigate?: () => void;
};

/**
 * Two-section sidebar. Top: workspace-wide nav (Dashboard, Settings) under a WORKSPACE heading,
 * with a RECENT-projects list below. Bottom: per-project nav when a project id is in the route,
 * with a "Back to projects" anchor at the very bottom.
 *
 * Sidebar is permanently expanded at 240px. The collapse toggle and icons-only mode were removed
 * because the alignment proved brittle and we ran out of time to nail it down. To bring collapse
 * back later, restore `useSidebarState` in AppShell + the toggle buttons here.
 */
export function AppSidebar({ mobile = false, onNavigate }: AppSidebarProps) {
  const { id } = useParams<{ id: string }>();
  const projectId = id && id !== 'new' ? id : undefined;
  const projectMode = Boolean(projectId);

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-background',
        mobile ? 'w-full' : 'hidden w-60 shrink-0 md:flex',
      )}
    >
      {/* Brand row aligns with the 56px topbar. */}
      <div className="flex h-14 items-center gap-2.5 border-b border-border-subtle px-4">
        <Link
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={onNavigate}
          to={ROUTES.DASHBOARD}
        >
          <BrandMark size={26} />
          <span className="text-[15px] font-semibold tracking-tight">buildmap</span>
        </Link>
        <span className="ml-1 rounded-full border border-border bg-subtle px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Beta
        </span>
      </div>

      <nav aria-label="Main" className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
          Workspace
        </p>
        {GLOBAL_NAV.map((item) => (
          <SidebarNavItem
            collapsed={false}
            item={item}
            key={item.id}
            onNavigate={onNavigate}
          />
        ))}

        <SidebarRecentProjects onNavigate={onNavigate} />

        {projectMode && (
          <>
            <p className="mt-5 px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
              Project
            </p>
            {PROJECT_NAV.map((item) => (
              <SidebarNavItem
                collapsed={false}
                item={item}
                key={item.id}
                onNavigate={onNavigate}
                projectId={projectId}
              />
            ))}
          </>
        )}
      </nav>

      {projectMode && (
        <div className="p-3">
          <Separator className="mb-3" />
          <SidebarNavItem collapsed={false} item={PROJECT_BACK_NAV} onNavigate={onNavigate} />
        </div>
      )}
    </aside>
  );
}
