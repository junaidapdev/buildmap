import { useEffect } from 'react';

/**
 * Warns before unsaved section edits are lost on browser refresh or tab close via `beforeunload`.
 * Shared by the PRD (Chunk 14) and architecture (Chunk 16) editors.
 *
 * In-app navigation blocking (React Router `useBlocker`) is intentionally NOT wired here: it
 * requires a data router, and this app uses `<BrowserRouter>`. Migrating routing is out of scope;
 * in-app nav blocking is tracked as a follow-up (see decisions.md).
 */
export function useDirtyGuard(isDirty: boolean): void {
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Required for some browsers to show the native confirmation prompt.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);
}
