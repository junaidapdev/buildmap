import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { CHUNKS_MESSAGES } from '@/features/projects/chunks/messages';

export function ChunksGatingState({ projectId }: { projectId: string }) {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h2 className="text-xl font-semibold">{CHUNKS_MESSAGES.GATING_TITLE}</h2>
      <p className="mt-2 text-muted-foreground">{CHUNKS_MESSAGES.GATING_BODY}</p>
      <Button asChild className="mt-6">
        <Link to={ROUTES.PROJECT_CONTEXT(projectId)}>{CHUNKS_MESSAGES.GATING_OPEN_CONTEXT}</Link>
      </Button>
    </div>
  );
}
