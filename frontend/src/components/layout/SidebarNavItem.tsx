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
 * One sidebar row.
 *
 * Two layouts share most styling:
 *   - Expanded: flex row with icon + label + optional count/shortcut. 30px tall, gap 9px.
 *   - Collapsed: a `grid place-items-center` 30×40 cell. Grid centering is unambiguous — no
 *     `w-full` math, no `justify-center` interaction with `gap`, no `sr-only` phantom slot.
 *     Whatever the parent nav's padding is, the icon ends up exactly at the center of the row.
 *
 * Accessibility when collapsed: the link/button carries `aria-label={item.label}` and the
 * surrounding Tooltip surfaces the label on hover.
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

  // Shared visual treatment (no layout primitive here — each branch picks its own).
  const baseClassName =
    'group h-[30px] rounded-md text-[13px] text-secondaryText transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  // Layout: collapsed uses grid place-items-center for ironclad centering; expanded uses flex.
  const layoutClassName = collapsed
    ? 'grid w-10 place-items-center'
    : 'flex w-full items-center gap-[9px] px-2';

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
              layoutClassName,
              'cursor-not-allowed opacity-60 hover:bg-hover',
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
          layoutClassName,
          'hover:bg-hover hover:text-foreground [&_svg]:group-hover:opacity-100',
          isActive && 'bg-inset font-medium text-foreground [&_svg]:opacity-100',
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
