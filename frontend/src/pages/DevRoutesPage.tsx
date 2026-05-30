import { GLOBAL_NAV, PROJECT_NAV, type NavItem } from '@/components/layout/nav-config';
import { ROUTES } from '@/constants/routes';

type RouteReportRow = {
  path: string;
  availability: string;
};

function reportNavItem(item: NavItem): RouteReportRow {
  const path = typeof item.to === 'string' ? item.to : item.to('sample-project');

  return {
    path,
    availability: item.pendingChunk ? `Available in Chunk ${item.pendingChunk}` : 'Available now',
  };
}

const PUBLIC_ROUTES: readonly RouteReportRow[] = [
  { path: ROUTES.HOME, availability: 'Available now' },
  { path: ROUTES.SIGN_IN, availability: 'Available now' },
  { path: ROUTES.AUTH_CALLBACK, availability: 'Available now' },
  { path: ROUTES.AUTH_CONFIRM, availability: 'Available now' },
] as const;

const ROUTE_REPORT = [
  ...PUBLIC_ROUTES,
  ...GLOBAL_NAV.map(reportNavItem),
  ...PROJECT_NAV.map(reportNavItem),
];

// Dev-only route map. Not shipped in production builds.
export function DevRoutesPage() {
  return (
    <section>
      <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight">Route map</h1>
      <p className="mt-2 text-muted-foreground">Current navigation activation status.</p>
      <div className="mt-6 overflow-hidden rounded-lg border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-4 py-3 font-medium">Route path</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {ROUTE_REPORT.map((route) => (
              <tr className="border-t" key={route.path}>
                <td className="px-4 py-3 font-mono text-xs">{route.path}</td>
                <td className="px-4 py-3 text-muted-foreground">{route.availability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
