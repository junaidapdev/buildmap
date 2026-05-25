import { Route, Routes } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { HomePage } from '@/pages/HomePage';

export function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route
        path="*"
        element={
          <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
            <p className="text-lg font-medium">404 — Page not found</p>
          </main>
        }
      />
    </Routes>
  );
}
