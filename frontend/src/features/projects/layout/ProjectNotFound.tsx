import { FileQuestion } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { PROJECT_LAYOUT_MESSAGES } from '@/features/projects/layout/messages';

export function ProjectNotFound() {
  return (
    <section className="flex flex-col items-center py-16 text-center" role="alert">
      <div className="mb-4 rounded-full bg-muted p-3 text-muted-foreground">
        <FileQuestion aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold">{PROJECT_LAYOUT_MESSAGES.NOT_FOUND_TITLE}</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        {PROJECT_LAYOUT_MESSAGES.NOT_FOUND_BODY}
      </p>
      <div className="mt-6">
        <Button asChild>
          <Link to={ROUTES.DASHBOARD}>{PROJECT_LAYOUT_MESSAGES.NOT_FOUND_BACK}</Link>
        </Button>
      </div>
    </section>
  );
}
