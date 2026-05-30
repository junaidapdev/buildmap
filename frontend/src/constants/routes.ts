export const ROUTES = {
  /** Public landing page (Chunk 30). Authenticated visitors are redirected to /dashboard. */
  HOME: '/',
  /** Unified auth surface. `?mode=signup` opens the sign-up tab. The legacy /sign-up route was
   *  removed in Chunk 30 and is now a Navigate-back-to-HOME fallback like any unknown path. */
  SIGN_IN: '/sign-in',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_CONFIRM: '/auth/confirm',
  DASHBOARD: '/dashboard',
  DEV_ROUTES: '/dev/routes',
  PROJECT_NEW: '/projects/new',
  PROJECT: (id: string) => `/projects/${id}`,
  PROJECT_CLARIFY: (id: string) => `/projects/${id}/clarify`,
  PROJECT_OVERVIEW: (id: string) => `/projects/${id}/overview`,
  PROJECT_BRIEF: (id: string) => `/projects/${id}/brief`,
  PROJECT_PRD: (id: string) => `/projects/${id}/prd`,
  PROJECT_ARCHITECTURE: (id: string) => `/projects/${id}/architecture`,
  PROJECT_CONTEXT: (id: string) => `/projects/${id}/context`,
  PROJECT_CHUNKS: (id: string) => `/projects/${id}/chunks`,
  PROJECT_CHUNK: (id: string, chunkId: string) => `/projects/${id}/chunks/${chunkId}`,
  PROJECT_PROGRESS: (id: string) => `/projects/${id}/progress`,
  PROJECT_ISSUES: (id: string) => `/projects/${id}/issues`,
  PROJECT_ISSUE: (id: string, issueId: string) => `/projects/${id}/issues/${issueId}`,
  PROJECT_KNOWLEDGE: (id: string) => `/projects/${id}/knowledge`,
  PROJECT_EXPORT: (id: string) => `/projects/${id}/export`,
  PROJECT_SETTINGS: (id: string) => `/projects/${id}/settings`,
  USER_SETTINGS: '/settings',
} as const;

/** Relative child segments for the nested `/projects/:id` route tree. */
export const PROJECT_SUBROUTES = {
  OVERVIEW: 'overview',
  BRIEF: 'brief',
  PRD: 'prd',
  ARCHITECTURE: 'architecture',
  CONTEXT: 'context',
  CHUNKS: 'chunks',
  CHUNK_DETAIL: 'chunks/:chunkId',
  PROGRESS: 'progress',
  ISSUES: 'issues',
  ISSUE_DETAIL: 'issues/:issueId',
  KNOWLEDGE: 'knowledge',
  CLARIFY: 'clarify',
} as const;
