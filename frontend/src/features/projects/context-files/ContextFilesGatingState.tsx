import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';

export function ContextFilesGatingState({ projectId }: { projectId: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-xl font-semibold">{CONTEXT_FILES_MESSAGES.GATING_TITLE}</h2>
      <p className="mt-2 text-muted-foreground">{CONTEXT_FILES_MESSAGES.GATING_BODY}</p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.PROJECT_ARCHITECTURE(projectId)}>
          {CONTEXT_FILES_MESSAGES.GATING_OPEN_ARCHITECTURE}
        </Link>
      </Button>
    </div>
  );
}
