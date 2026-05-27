import { lazy, Suspense, type PropsWithChildren } from 'react';
import { Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { FullScreenLoader } from '@/components/layout/FullScreenLoader';
import { NotFoundPage } from '@/components/layout/NotFoundPage';
import { Skeleton } from '@/components/ui/skeleton';
import { DEV_ROUTES_PAGE_LOADER } from '@/config/env';
import { ROUTES } from '@/constants/routes';
import { EmailConfirmPage } from '@/features/auth/EmailConfirmPage';
import { OAuthCallbackPage } from '@/features/auth/OAuthCallbackPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignInPage } from '@/features/auth/SignInPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { useAuth } from '@/features/auth/useAuth';
import { DashboardPlaceholder } from '@/pages/DashboardPlaceholder';
import { HomePage } from '@/pages/HomePage';
import { ProjectModePlaceholder } from '@/pages/ProjectModePlaceholder';

const devRoutesPageLoader = DEV_ROUTES_PAGE_LOADER;

const DevRoutesPage = devRoutesPageLoader
  ? lazy(async () => {
      const module = await devRoutesPageLoader();
      return { default: module.DevRoutesPage };
    })
  : null;

function ProtectedShell({ children }: PropsWithChildren) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

function NotFoundRoute() {
  const { session } = useAuth();

  if (session) {
    return (
      <AppShell>
        <NotFoundPage variant="signedIn" />
      </AppShell>
    );
  }

  return <NotFoundPage variant="signedOut" />;
}

function ProtectedNotFoundRoute() {
  return (
    <ProtectedShell>
      <NotFoundPage variant="signedIn" />
    </ProtectedShell>
  );
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
      <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
      <Route path={ROUTES.AUTH_CALLBACK} element={<OAuthCallbackPage />} />
      <Route path={ROUTES.AUTH_CONFIRM} element={<EmailConfirmPage />} />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedShell>
            <DashboardPlaceholder />
          </ProtectedShell>
        }
      />
      {DevRoutesPage && (
        <Route
          path={ROUTES.DEV_ROUTES}
          element={
            <ProtectedShell>
              <Suspense fallback={<Skeleton className="h-24 w-full max-w-sm" />}>
                <DevRoutesPage />
              </Suspense>
            </ProtectedShell>
          }
        />
      )}
      <Route path={ROUTES.USER_SETTINGS} element={<ProtectedNotFoundRoute />} />
      <Route path={ROUTES.PROJECT_NEW} element={<ProtectedNotFoundRoute />} />
      <Route
        path={ROUTES.PROJECT_SHELL}
        element={
          <ProtectedShell>
            {/* TODO(chunk-11): remove this stub when the real project layout lands. */}
            <ProjectModePlaceholder />
          </ProtectedShell>
        }
      />
      <Route path="*" element={<NotFoundRoute />} />
    </Routes>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}
