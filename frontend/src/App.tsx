import { lazy, Suspense, type PropsWithChildren } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from '@/components/layout/AppShell';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { FullScreenLoader } from '@/components/layout/FullScreenLoader';
import { NotFoundPage } from '@/components/layout/NotFoundPage';
import { Skeleton } from '@/components/ui/skeleton';
import { DEV_ROUTES_PAGE_LOADER } from '@/config/env';
import { PROJECT_SUBROUTES, ROUTES } from '@/constants/routes';
import { EmailConfirmPage } from '@/features/auth/EmailConfirmPage';
import { OAuthCallbackPage } from '@/features/auth/OAuthCallbackPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignInPage } from '@/features/auth/SignInPage';
import { useAuth } from '@/features/auth/useAuth';
import { LandingPage } from '@/features/landing/LandingPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { BriefPage } from '@/features/projects/brief/BriefPage';
import { ClarifyPage } from '@/features/projects/clarify/ClarifyPage';
import { ArchitecturePage } from '@/features/projects/architecture/ArchitecturePage';
import { ChunksPage } from '@/features/projects/chunks/ChunksPage';
import { ContextFilesPage } from '@/features/projects/context-files/ContextFilesPage';
import { ChunkDetailPage } from '@/features/projects/feature-specs/ChunkDetailPage';
import { IssueDetailPage } from '@/features/projects/issues/IssueDetailPage';
import { IssuesListPage } from '@/features/projects/issues/IssuesListPage';
import { KnowledgePage } from '@/features/projects/knowledge/KnowledgePage';
import { ProgressPage } from '@/features/projects/progress/ProgressPage';
import { ProjectLayout } from '@/features/projects/layout/ProjectLayout';
import { NewProjectPage } from '@/features/projects/new/NewProjectPage';
import { OverviewPage } from '@/features/projects/overview/OverviewPage';
import { PrdPage } from '@/features/projects/prd/PrdPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

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

  // Chunk 30: unknown URLs for unauthenticated visitors fall through to the public landing page
  // rather than a not-found card. Marketing surface beats a dead end.
  return <Navigate replace to={ROUTES.HOME} />;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<LandingPage />} />
      <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
      {/* Chunk 30: /sign-up is no longer a distinct route. Inbound links land on the unified
          auth surface with the sign-up tab pre-selected. */}
      <Route
        path="/sign-up"
        element={<Navigate replace to={`${ROUTES.SIGN_IN}?mode=signup`} />}
      />
      <Route path={ROUTES.AUTH_CALLBACK} element={<OAuthCallbackPage />} />
      <Route path={ROUTES.AUTH_CONFIRM} element={<EmailConfirmPage />} />
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedShell>
            <DashboardPage />
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
      <Route
        path={ROUTES.USER_SETTINGS}
        element={
          <ProtectedShell>
            <SettingsPage />
          </ProtectedShell>
        }
      />
      <Route
        path={ROUTES.PROJECT_NEW}
        element={
          <ProtectedShell>
            <NewProjectPage />
          </ProtectedShell>
        }
      />
      <Route
        path={ROUTES.PROJECT(':id')}
        element={
          <ProtectedShell>
            <ProjectLayout />
          </ProtectedShell>
        }
      >
        <Route index element={<Navigate replace to={PROJECT_SUBROUTES.OVERVIEW} />} />
        <Route path={PROJECT_SUBROUTES.OVERVIEW} element={<OverviewPage />} />
        <Route path={PROJECT_SUBROUTES.BRIEF} element={<BriefPage />} />
        <Route path={PROJECT_SUBROUTES.PRD} element={<PrdPage />} />
        <Route path={PROJECT_SUBROUTES.ARCHITECTURE} element={<ArchitecturePage />} />
        <Route path={PROJECT_SUBROUTES.CONTEXT} element={<ContextFilesPage />} />
        <Route path={PROJECT_SUBROUTES.CHUNKS} element={<ChunksPage />} />
        <Route path={PROJECT_SUBROUTES.CHUNK_DETAIL} element={<ChunkDetailPage />} />
        <Route path={PROJECT_SUBROUTES.PROGRESS} element={<ProgressPage />} />
        <Route path={PROJECT_SUBROUTES.ISSUES} element={<IssuesListPage />} />
        <Route path={PROJECT_SUBROUTES.ISSUE_DETAIL} element={<IssueDetailPage />} />
        <Route path={PROJECT_SUBROUTES.KNOWLEDGE} element={<KnowledgePage />} />
        <Route path={PROJECT_SUBROUTES.CLARIFY} element={<ClarifyPage />} />
        <Route path="*" element={<NotFoundPage variant="signedIn" />} />
      </Route>
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
