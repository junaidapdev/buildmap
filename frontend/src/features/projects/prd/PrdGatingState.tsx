import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { PRD_MESSAGES } from '@/features/projects/prd/messages';

export function PrdGatingState({ projectId }: { projectId: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-xl font-semibold">{PRD_MESSAGES.GATING_TITLE}</h2>
      <p className="mt-2 text-muted-foreground">{PRD_MESSAGES.GATING_BODY}</p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.PROJECT_BRIEF(projectId)}>{PRD_MESSAGES.GATING_OPEN_BRIEF}</Link>
      </Button>
    </div>
  );
}
