import { NavLink } from 'react-router-dom';

import type { NavItem } from '@/components/layout/nav-config';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type SidebarNavItemProps = {
  item: NavItem;
  collapsed: boolean;
  projectId?: string;
  onNavigate?: () => void;
  /** Optional right-aligned count (e.g. "4", "12/24"). Hidden when the sidebar is collapsed. */
  count?: string | number;
  /** Optional keyboard-shortcut hint (e.g. "N") shown like a kbd pill. */
  shortcut?: string;
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

/**
 * One sidebar row. Tighter (30px) than the previous 40px-tall rows to match the design's denser
 * navigation rhythm. Renders the icon at 70% opacity until active/hover, then full strength. The
 * optional `count` / `shortcut` slot sits on the right and matches `tabular-nums` so columns of
 * counts align cleanly between rows.
 *
 * When the sidebar is collapsed, the label span and the count/shortcut slot are NOT rendered at
 * all (rather than visually hidden with `sr-only`) so the flex `gap` between icon and label can't
 * leave a phantom 9px space that would push the icon off-center. Accessibility comes from
 * `aria-label` on the link/button and the existing hover Tooltip.
 */
export function SidebarNavItem({
  item,
  collapsed,
  projectId,
  onNavigate,
  count,
  shortcut,
}: SidebarNavItemProps) {
  const Icon = item.icon;
  // Drop the flex `gap` when collapsed so the icon sits cleanly in the centered row.
  const baseClassName = cn(
    'group flex h-[30px] w-full items-center rounded-md px-2 text-[13px] text-secondaryText transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    collapsed ? 'gap-0' : 'gap-[9px]',
  );

  const rowContents = (
    <>
      <Icon className="size-4 shrink-0 opacity-70 transition-opacity" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && (count !== undefined || shortcut) && (
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] tabular-nums text-faint">
          {count !== undefined && <span>{count}</span>}
          {shortcut && <span className="kbd">{shortcut}</span>}
        </span>
      )}
    </>
  );

  if (item.pendingChunk) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            aria-disabled="true"
            aria-label={collapsed ? item.label : undefined}
            className={cn(
              baseClassName,
              'cursor-not-allowed opacity-60 hover:bg-hover',
              collapsed && 'justify-center px-0',
            )}
            type="button"
          >
            {rowContents}
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
      aria-label={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          baseClassName,
          'hover:bg-hover hover:text-foreground',
          '[&_svg]:group-hover:opacity-100',
          collapsed && 'justify-center px-0',
          isActive &&
            'bg-inset font-medium text-foreground [&_svg]:opacity-100',
        )
      }
      end
      onClick={onNavigate}
      to={itemDestination(item, projectId)}
    >
      {rowContents}
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
