import { Menu } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';

type AppHeaderProps = {
  onOpenNavigation: () => void;
};

/**
 * 56px topbar. The wordmark lives in the sidebar; the topbar gets a mobile menu trigger, a thin
 * breadcrumb-ish placeholder (rendered as a faint divider hint when no breadcrumb is set), and the
 * UserMenu on the right. Keeping this minimal so individual pages can own their own page header
 * (title + subtitle + actions) inside the main content area.
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
      <UserMenu />
    </header>
  );
}
