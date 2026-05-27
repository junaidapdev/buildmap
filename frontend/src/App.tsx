import { Route, Routes, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { EmailConfirmPage } from '@/features/auth/EmailConfirmPage';
import { AUTH_MESSAGES } from '@/features/auth/messages';
import { OAuthCallbackPage } from '@/features/auth/OAuthCallbackPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { SignInPage } from '@/features/auth/SignInPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { useAuth } from '@/features/auth/useAuth';
import { HomePage } from '@/pages/HomePage';

function DashboardPlaceholder() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut(): Promise<void> {
    await signOut();
    navigate(ROUTES.SIGN_IN, { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <section className="space-y-6 rounded-lg border bg-card p-8 text-center text-card-foreground shadow-sm">
        {/* TODO(chunk-07): replace with the real dashboard. */}
        <h1 className="text-lg font-medium">{AUTH_MESSAGES.DASHBOARD_PLACEHOLDER}</h1>
        <Button type="button" variant="outline" onClick={() => void handleSignOut()}>
          {AUTH_MESSAGES.SIGN_OUT_BUTTON}
        </Button>
      </section>
    </main>
  );
}

export function App() {
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
          <RequireAuth>
            <DashboardPlaceholder />
          </RequireAuth>
        }
      />
      <Route
        path="*"
        element={
          <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <p className="text-lg font-medium">404 - Page not found</p>
          </main>
        }
      />
    </Routes>
  );
}
