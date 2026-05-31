import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { BrandMark } from '@/components/layout/BrandMark';
import { GLOBAL_NAV, PROJECT_BACK_NAV, PROJECT_NAV } from '@/components/layout/nav-config';
import { SidebarNavItem } from '@/components/layout/SidebarNavItem';
import { SidebarRecentProjects } from '@/components/layout/SidebarRecentProjects';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

type AppSidebarProps = {
  collapsed?: boolean;
  mobile?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onNavigate?: () => void;
};

/**
 * Two-section sidebar. Top: workspace-wide nav (Dashboard, Settings) with a `WORKSPACE` heading.
 * Bottom: per-project nav when a project id is in the route, with the project name heading. The
 * brand mark + wordmark live in a 56px header that aligns with the topbar. A BETA pill sits next
 * to the wordmark to match the design.
 */
export function AppSidebar({
  collapsed = false,
  mobile = false,
  onCollapsedChange,
  onNavigate,
}: AppSidebarProps) {
  const { id } = useParams<{ id: string }>();
  const projectId = id && id !== 'new' ? id : undefined;
  const projectMode = Boolean(projectId);
  const isCollapsed = mobile ? false : collapsed;

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-background transition-[width] duration-200',
        mobile ? 'w-full' : 'hidden shrink-0 md:flex',
        !mobile && (isCollapsed ? 'w-16' : 'w-60'),
      )}
    >
      {/* Brand row aligns with the 56px topbar. When the sidebar is collapsed to 64px there is
          not enough room for both the BrandMark (24px) and the toggle button (28px) plus a gap,
          so the toggle moves into its own centered row below — see the next block. */}
      <div
        className={cn(
          'flex h-14 items-center gap-2.5 border-b border-border-subtle px-4',
          isCollapsed && 'justify-center px-0',
        )}
      >
        <Link
          aria-label={isCollapsed ? 'buildmap dashboard' : undefined}
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          onClick={onNavigate}
          to={ROUTES.DASHBOARD}
        >
          <BrandMark size={isCollapsed ? 24 : 26} />
          {!isCollapsed && (
            <span className="text-[15px] font-semibold tracking-tight">buildmap</span>
          )}
        </Link>
        {!isCollapsed && (
          <span className="ml-1 rounded-full border border-border bg-subtle px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Beta
          </span>
        )}
        {!mobile && !isCollapsed && (
          <Button
            aria-label="Collapse sidebar"
            className="ml-auto h-7 w-7"
            onClick={() => onCollapsedChange?.(!isCollapsed)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <PanelLeftClose aria-hidden="true" className="size-4" />
          </Button>
        )}
      </div>

      {/* Dedicated expand toggle when collapsed — its own row gives the 28px button room to
          breathe and centers it cleanly under the BrandMark, replacing the cramped two-icon
          brand row. */}
      {!mobile && isCollapsed && (
        <div className="flex justify-center border-b border-border-subtle py-2">
          <Button
            aria-label="Expand sidebar"
            className="h-7 w-7"
            onClick={() => onCollapsedChange?.(!isCollapsed)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <PanelLeftOpen aria-hidden="true" className="size-4" />
          </Button>
        </div>
      )}

      <nav
        aria-label="Main"
        className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4"
      >
        {!isCollapsed && (
          <p className="px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
            Workspace
          </p>
        )}
        {GLOBAL_NAV.map((item) => (
          <SidebarNavItem
            collapsed={isCollapsed}
            item={item}
            key={item.id}
            onNavigate={onNavigate}
          />
        ))}

        {/* RECENT section fills the otherwise-empty sidebar space below WORKSPACE on the
            dashboard. Hidden when the sidebar is collapsed to icons-only. */}
        {!isCollapsed && <SidebarRecentProjects onNavigate={onNavigate} />}

        {projectMode && (
          <>
            {!isCollapsed && (
              <p className="mt-5 px-2 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-faint">
                Project
              </p>
            )}
            {PROJECT_NAV.map((item) => (
              <SidebarNavItem
                collapsed={isCollapsed}
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
          <SidebarNavItem
            collapsed={isCollapsed}
            item={PROJECT_BACK_NAV}
            onNavigate={onNavigate}
          />
        </div>
      )}
    </aside>
  );
}
