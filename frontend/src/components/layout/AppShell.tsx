import { useState, type PropsWithChildren } from 'react';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { useSidebarState } from '@/components/layout/useSidebarState';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type AppShellProps = PropsWithChildren<{
  containerClassName?: string;
}>;

/**
 * Provides authenticated application chrome. Pages may pass `containerClassName`
 * to narrow or adjust the standard `max-w-6xl` content container.
 */
export function AppShell({ children, containerClassName }: AppShellProps) {
  const [collapsed, setCollapsed] = useSidebarState();
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-background px-4 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <AppSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />
        <Sheet open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen}>
          <SheetContent side="left" className="w-64 p-0 sm:max-w-64">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate between buildmap workspace pages.
            </SheetDescription>
            <AppSidebar mobile onNavigate={() => setMobileNavigationOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onOpenNavigation={() => setMobileNavigationOpen(true)} />
          <main id="main-content" tabIndex={-1} className="flex-1 overflow-auto">
            <div className={cn('mx-auto w-full max-w-6xl px-4 py-8 sm:px-6', containerClassName)}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
