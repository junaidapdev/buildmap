import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { GLOBAL_NAV, PROJECT_BACK_NAV, PROJECT_NAV } from '@/components/layout/nav-config';
import { SidebarNavItem } from '@/components/layout/SidebarNavItem';
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
  const navItems = projectMode ? PROJECT_NAV : GLOBAL_NAV;

  return (
    <aside
      className={cn(
        'flex h-full flex-col border-r bg-card transition-[width] duration-200',
        mobile ? 'w-full' : 'hidden shrink-0 md:flex',
        !mobile && (isCollapsed ? 'w-16' : 'w-64'),
      )}
    >
      <div className={cn('flex h-14 items-center gap-2 px-3', isCollapsed && 'justify-center')}>
        <Link
          to={ROUTES.DASHBOARD}
          onClick={onNavigate}
          className="rounded-md font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={isCollapsed ? 'buildmap dashboard' : undefined}
        >
          {isCollapsed ? 'b' : 'buildmap'}
        </Link>
        {!mobile && !isCollapsed && (
          <span className="text-xs text-muted-foreground">workspace</span>
        )}
        {!mobile && (
          <Button
            className={cn('ml-auto', isCollapsed && 'ml-0')}
            type="button"
            variant="ghost"
            size="icon"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => onCollapsedChange?.(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelLeftOpen aria-hidden="true" />
            ) : (
              <PanelLeftClose aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-2 py-4" aria-label={projectMode ? 'Project' : 'Main'}>
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            item={item}
            collapsed={isCollapsed}
            projectId={projectId}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
      {projectMode && (
        <div className="p-2">
          <Separator className="mb-2" />
          <SidebarNavItem item={PROJECT_BACK_NAV} collapsed={isCollapsed} onNavigate={onNavigate} />
        </div>
      )}
    </aside>
  );
}
