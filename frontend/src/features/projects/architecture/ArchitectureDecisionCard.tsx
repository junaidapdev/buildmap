import type {
  ArchitectureDecision,
  ArchitectureDecisionStatus,
} from '@shared/schemas/architecture';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';

const STATUS_VARIANT: Record<
  ArchitectureDecisionStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  accepted: 'default',
  proposed: 'secondary',
  superseded: 'outline',
  rejected: 'destructive',
};

function DecisionField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">{value}</p>
    </div>
  );
}

export function ArchitectureDecisionCard({ decision }: { decision: ArchitectureDecision }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-medium leading-snug">{decision.title}</h3>
          <Badge className="shrink-0" variant={STATUS_VARIANT[decision.status]}>
            {ARCHITECTURE_MESSAGES.DECISION_STATUS_LABELS[decision.status]}
          </Badge>
        </div>
        <DecisionField label={ARCHITECTURE_MESSAGES.DECISION_CONTEXT} value={decision.context} />
        <DecisionField label={ARCHITECTURE_MESSAGES.DECISION_DECISION} value={decision.decision} />
        <DecisionField
          label={ARCHITECTURE_MESSAGES.DECISION_CONSEQUENCES}
          value={decision.consequences}
        />
      </CardContent>
    </Card>
  );
}
