import { useState, type PropsWithChildren } from 'react';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type AppShellProps = PropsWithChildren<{
  containerClassName?: string;
}>;

/**
 * Provides authenticated application chrome. Pages may pass `containerClassName`
 * to adjust the standard content container; by default the container provides
 * horizontal screen-edge padding and top/bottom vertical rhythm, but NO max-width.
 *
 * The max-width opinion moved into each page so that wide surfaces (Chunks board) can fill the
 * available viewport while narrow surfaces (Brief / PRD / Architecture prose docs) keep their
 * comfortable reading column. Pages that want the legacy ~6xl behaviour can wrap their root in
 * `mx-auto max-w-6xl`.
 *
 * The outer container uses `h-screen overflow-hidden` so the sidebar always reaches the bottom of
 * the viewport regardless of how tall the page contents are. `<main>` carries `overflow-auto`,
 * so scrolling happens inside the main column instead of the whole page.
 *
 * The collapsible-sidebar feature was removed: the toggle is no longer rendered, and the sidebar
 * is permanently in its expanded 240px form. The previous icons-only mode had alignment issues
 * that proved hard to debug under time pressure; rather than ship a broken state we just keep the
 * sidebar open. The `useSidebarState` hook stays in the codebase if a future iteration wants to
 * reintroduce the feature.
 */
export function AppShell({ children, containerClassName }: AppShellProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only z-50 rounded-md bg-background px-4 py-2 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to main content
        </a>
        <AppSidebar />
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
            <div className={cn('w-full px-4 py-6 sm:px-6 sm:py-8', containerClassName)}>
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
