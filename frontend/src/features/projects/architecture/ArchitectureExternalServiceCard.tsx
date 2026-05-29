import type { ArchitectureExternalService } from '@shared/schemas/architecture';
import { Card, CardContent } from '@/components/ui/card';

export function ArchitectureExternalServiceCard({
  service,
}: {
  service: ArchitectureExternalService;
}) {
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <h3 className="font-medium">{service.name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{service.purpose}</p>
        {service.notes ? (
          <p className="text-sm leading-relaxed text-muted-foreground/80">{service.notes}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
