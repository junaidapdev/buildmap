import { NavLink } from 'react-router-dom';

import type { NavItem } from '@/components/layout/nav-config';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type SidebarNavItemProps = {
  item: NavItem;
  collapsed: boolean;
  projectId?: string;
  onNavigate?: () => void;
};

function itemDestination(item: NavItem, projectId?: string): string {
  if (typeof item.to === 'string') {
    return item.to;
  }

  if (!projectId) {
    throw new Error('A project id is required for project navigation.');
  }

  return item.to(projectId);
}

export function SidebarNavItem({ item, collapsed, projectId, onNavigate }: SidebarNavItemProps) {
  const Icon = item.icon;
  const contents = (
    <>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className={cn(collapsed && 'sr-only')}>{item.label}</span>
    </>
  );
  const baseClassName =
    'flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  if (item.pendingChunk) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-disabled="true"
            className={cn(
              baseClassName,
              'cursor-not-allowed text-muted-foreground opacity-70 hover:bg-muted/60',
              collapsed && 'justify-center px-0',
            )}
          >
            {contents}
          </button>
        </TooltipTrigger>
        <TooltipContent side={collapsed ? 'right' : 'top'}>
          Available in Chunk {item.pendingChunk}
        </TooltipContent>
      </Tooltip>
    );
  }

  const link = (
    <NavLink
      to={itemDestination(item, projectId)}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          baseClassName,
          'hover:bg-accent hover:text-accent-foreground',
          collapsed && 'justify-center px-0',
          isActive && 'bg-accent font-medium text-accent-foreground',
        )
      }
    >
      {contents}
    </NavLink>
  );

  if (!collapsed) {
    return link;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
