import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';

export function ArchitectureGatingState({ projectId }: { projectId: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-xl font-semibold">{ARCHITECTURE_MESSAGES.GATING_TITLE}</h2>
      <p className="mt-2 text-muted-foreground">{ARCHITECTURE_MESSAGES.GATING_BODY}</p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.PROJECT_PRD(projectId)}>{ARCHITECTURE_MESSAGES.GATING_OPEN_PRD}</Link>
      </Button>
    </div>
  );
}
