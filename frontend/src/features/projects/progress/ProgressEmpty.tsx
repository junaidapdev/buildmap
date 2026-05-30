import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { PROGRESS_MESSAGES } from '@/features/projects/progress/messages';

type ProgressEmptyProps = {
  projectId: string;
};

export function ProgressEmpty({ projectId }: ProgressEmptyProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed p-12 text-center">
      <h3 className="text-lg font-semibold">{PROGRESS_MESSAGES.EMPTY_TITLE}</h3>
      <p className="text-muted-foreground">{PROGRESS_MESSAGES.EMPTY_BODY}</p>
      <Button asChild>
        <Link to={ROUTES.PROJECT_CHUNKS(projectId)}>{PROGRESS_MESSAGES.EMPTY_OPEN_CHUNKS}</Link>
      </Button>
    </div>
  );
}
