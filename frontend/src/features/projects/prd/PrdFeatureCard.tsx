import type { PrdContent } from '@shared/schemas/prd';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PRD_MESSAGES } from '@/features/projects/prd/messages';

type PrdFeature = PrdContent['features'][number];

const PRIORITY_VARIANT: Record<PrdFeature['priority'], 'destructive' | 'default' | 'secondary'> = {
  must_have: 'destructive',
  should_have: 'default',
  nice_to_have: 'secondary',
};

export function PrdFeatureCard({ feature }: { feature: PrdFeature }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium">{feature.name}</h3>
          <Badge className="shrink-0" variant={PRIORITY_VARIANT[feature.priority]}>
            {PRD_MESSAGES.PRIORITY_LABELS[feature.priority]}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
      </CardContent>
    </Card>
  );
}
