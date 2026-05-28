import type { ArchitectureComponent } from '@shared/schemas/architecture';
import { Card, CardContent } from '@/components/ui/card';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';

export function ArchitectureComponentCard({ component }: { component: ArchitectureComponent }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h3 className="font-medium">{component.name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{component.description}</p>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {ARCHITECTURE_MESSAGES.COMPONENT_RESPONSIBILITIES}
          </p>
          <ul className="mt-2 ml-5 list-disc space-y-1 text-sm">
            {component.responsibilities.map((responsibility, index) => (
              <li key={index}>{responsibility}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
