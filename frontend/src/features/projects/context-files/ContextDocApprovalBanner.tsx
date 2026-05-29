import { CheckCircle2 } from 'lucide-react';

import { Alert, AlertTitle } from '@/components/ui/alert';
import { CONTEXT_FILES_MESSAGES } from '@/features/projects/context-files/messages';

export function ContextDocApprovalBanner() {
  return (
    <Alert className="border-green-600/40 text-green-700 dark:border-green-500/40 dark:text-green-500 [&>svg]:text-green-600 dark:[&>svg]:text-green-500">
      <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
      <AlertTitle className="mb-0">{CONTEXT_FILES_MESSAGES.APPROVED_BANNER_TITLE}</AlertTitle>
    </Alert>
  );
}
