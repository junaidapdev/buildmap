import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

import { UserMenu } from '@/components/layout/UserMenu';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

type AppHeaderProps = {
  onOpenNavigation: () => void;
};

export function AppHeader({ onOpenNavigation }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background px-4 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={onOpenNavigation}
      >
        <Menu aria-hidden="true" />
      </Button>
      <Link
        className="rounded-md font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        to={ROUTES.DASHBOARD}
      >
        buildmap
      </Link>
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
