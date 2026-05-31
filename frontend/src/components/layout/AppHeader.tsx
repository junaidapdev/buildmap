import { Menu, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

type AppHeaderProps = {
  onOpenNavigation: () => void;
};

/**
 * 56px topbar. The wordmark lives in the sidebar; the topbar carries the workspace-level primary
 * action (`+ New project`) on the right next to the UserMenu so the most important action is
 * available from anywhere in the app — not just from the dashboard. Mobile collapses the button
 * label to keep the bar compact.
 *
 * The mobile menu trigger sits on the left and is hidden from `md+` viewports where the
 * persistent sidebar takes over.
 */
export function AppHeader({ onOpenNavigation }: AppHeaderProps) {
  // Reserved for future per-route breadcrumb rendering (currently a no-op on every route).
  useParams<{ id: string }>();

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border-subtle bg-background/80 px-4 backdrop-blur sm:px-6">
      <Button
        aria-label="Open navigation"
        className="h-8 w-8 md:hidden"
        onClick={onOpenNavigation}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Menu aria-hidden="true" className="size-4" />
      </Button>
      <div className="flex-1" />
      <Button asChild className="h-8" size="sm">
        <Link to={ROUTES.PROJECT_NEW}>
          <Plus aria-hidden="true" className="size-3.5" />
          <span className="hidden sm:inline">New project</span>
          <span className="sr-only sm:hidden">New project</span>
        </Link>
      </Button>
      <UserMenu />
    </header>
  );
}
