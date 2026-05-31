import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ROUTES } from '@/constants/routes';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';

type ArchitectureActionsProps = {
  projectId: string;
  isFinal: boolean;
};

/**
 * End-of-document footer ribbon. The page's primary actions (Approve / Regenerate all / Export)
 * live in the ArchitectureView header toolbar; this component is reduced to the "approved → next:
 * context files" guidance banner. Hidden entirely when the architecture is not yet approved.
 */
export function ArchitectureActions({ projectId, isFinal }: ArchitectureActionsProps) {
  if (!isFinal) {
    return null;
  }

  return (
    <div className="border-t border-border-subtle pt-6">
      <Alert className="border-green-600/40 text-green-700 dark:border-green-500/40 dark:text-green-500 [&>svg]:text-green-600 dark:[&>svg]:text-green-500">
        <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
        <AlertTitle>{ARCHITECTURE_MESSAGES.APPROVED_BANNER}</AlertTitle>
        <AlertDescription>
          <Link
            className="font-medium underline underline-offset-4"
            to={ROUTES.PROJECT_CONTEXT(projectId)}
          >
            {ARCHITECTURE_MESSAGES.NEXT_CTA}
          </Link>
        </AlertDescription>
      </Alert>
    </div>
  );
}
