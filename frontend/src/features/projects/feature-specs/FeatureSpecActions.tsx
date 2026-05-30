import { CheckCircle2, RefreshCw } from 'lucide-react';

import { Alert, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';
import { useApproveFeatureSpec } from '@/features/projects/feature-specs/useApproveFeatureSpec';
import type { FeatureSpecRow } from '@/features/projects/feature-specs/useExistingFeatureSpec';
import { useGenerateFeatureSpec } from '@/features/projects/feature-specs/useGenerateFeatureSpec';

type FeatureSpecActionsProps = {
  spec: FeatureSpecRow;
  chunkId: string;
};

export function FeatureSpecActions({ spec, chunkId }: FeatureSpecActionsProps) {
  const approve = useApproveFeatureSpec(chunkId);
  const generate = useGenerateFeatureSpec(chunkId);

  return (
    <div className="space-y-4 border-t pt-6">
      {spec.is_final && (
        <Alert className="border-green-600/40 text-green-700 dark:border-green-500/40 dark:text-green-500 [&>svg]:text-green-600 dark:[&>svg]:text-green-500">
          <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
          <AlertTitle>{FEATURE_SPEC_MESSAGES.APPROVED_BANNER}</AlertTitle>
        </Alert>
      )}

      {approve.isError && (
        <p className="text-sm text-destructive">{FEATURE_SPEC_MESSAGES.APPROVE_FAILED}</p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        {!spec.is_final && (
          <Button
            aria-busy={approve.isPending}
            disabled={approve.isPending || generate.isPending}
            onClick={() => approve.mutate()}
          >
            {approve.isPending
              ? FEATURE_SPEC_MESSAGES.APPROVE_BUTTON_BUSY
              : FEATURE_SPEC_MESSAGES.APPROVE_BUTTON}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              aria-busy={generate.isPending}
              disabled={generate.isPending || approve.isPending}
              variant="outline"
            >
              <RefreshCw aria-hidden="true" className="h-4 w-4" />
              {generate.isPending
                ? FEATURE_SPEC_MESSAGES.REGENERATE_BUSY
                : FEATURE_SPEC_MESSAGES.REGENERATE_BUTTON}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
              <AlertDialogDescription>
                {FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_BODY}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
              <AlertDialogAction onClick={() => generate.mutate()}>
                {FEATURE_SPEC_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <p className="text-right text-xs text-muted-foreground">
        {FEATURE_SPEC_MESSAGES.REGENERATE_HINT}
      </p>
    </div>
  );
}
