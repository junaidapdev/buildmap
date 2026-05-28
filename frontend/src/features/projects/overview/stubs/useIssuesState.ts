// Stub for the not-yet-built issues feature. The open-issues panel reads here; swapping this body
// for a real query later activates the panel without changing the overview page.
// TODO(chunk-23): replace with a real query for the project's open issues.
// Future query key: ['overview', 'issues', projectId].
export type IssueSummary = { id: string; title: string; createdAt: string };
export type IssuesState = { openCount: number; recent: IssueSummary[] };

export function useIssuesState(_projectId: string): { data: IssuesState } {
  return { data: { openCount: 0, recent: [] } };
}
