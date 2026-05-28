import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';

type EmptyPanelContentProps = {
  title: string;
  body: string;
  cta?: { label: string; to: string };
};

export function EmptyPanelContent({ title, body, cta }: EmptyPanelContentProps) {
  return (
    <div className="py-6 text-center">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {cta && (
        <Button asChild className="mt-4" size="sm" variant="outline">
          <Link to={cta.to}>{cta.label}</Link>
        </Button>
      )}
    </div>
  );
}
