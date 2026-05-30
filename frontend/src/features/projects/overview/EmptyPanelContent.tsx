import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

type EmptyPanelContentProps = {
  title: string;
  body: string;
  cta?: { label: string; to: string };
};

/**
 * Panel-internal empty state. Tighter than the page-level EmptyDashboard — no icon tile, just a
 * tight title + body + optional CTA. The faint title color matches the design's "calm" feel for
 * empty panels (something to fill in, not something missing).
 */
export function EmptyPanelContent({ title, body, cta }: EmptyPanelContentProps) {
  return (
    <div className="py-5 text-center">
      <p className="text-[13px] font-medium">{title}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{body}</p>
      {cta && (
        <Button asChild className="mt-3.5" size="sm" variant="outline">
          <Link to={cta.to}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}
