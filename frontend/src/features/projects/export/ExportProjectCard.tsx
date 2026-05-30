import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EXPORT_MESSAGES } from '@/features/projects/export/messages';
import { useExportProjectZip } from '@/features/projects/export/useExportProjectZip';

type Props = {
  projectId: string;
  projectName: string;
};

export function ExportProjectCard({ projectId, projectName }: Props) {
  const exportMutation = useExportProjectZip();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const errorMessage = exportMutation.isError
    ? exportMutation.error?.message === 'EXPORT_TOO_LARGE'
      ? EXPORT_MESSAGES.ERROR_TOO_LARGE
      : EXPORT_MESSAGES.ERROR_GENERIC
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{EXPORT_MESSAGES.CARD_TITLE}</CardTitle>
        <CardDescription>{EXPORT_MESSAGES.CARD_BODY}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full sm:w-auto"
          disabled={exportMutation.isPending}
          onClick={() => setConfirmOpen(true)}
        >
          {exportMutation.isPending
            ? EXPORT_MESSAGES.CARD_BUTTON_BUSY
            : EXPORT_MESSAGES.CARD_BUTTON}
        </Button>
        {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
      </CardContent>

      <AlertDialog onOpenChange={setConfirmOpen} open={confirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{EXPORT_MESSAGES.CONFIRM_TITLE}</AlertDialogTitle>
            <AlertDialogDescription>{EXPORT_MESSAGES.CONFIRM_BODY}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{EXPORT_MESSAGES.CONFIRM_CANCEL}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                exportMutation.mutate({ projectId, projectName });
              }}
            >
              {EXPORT_MESSAGES.CONFIRM_CONFIRM}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
