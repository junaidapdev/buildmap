import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { SETTINGS_MESSAGES } from '@/features/settings/messages';
import { useDeleteAccount } from '@/features/settings/useDeleteAccount';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteAccountDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const deleteAccount = useDeleteAccount();
  const [phrase, setPhrase] = useState('');

  const phraseMatches = phrase === SETTINGS_MESSAGES.DELETE_DIALOG_PHRASE_EXPECTED;

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPhrase('');
    }
    onOpenChange(next);
  };

  const handleConfirm = () => {
    void deleteAccount.mutateAsync('delete my account').then(() => {
      onOpenChange(false);
      navigate(ROUTES.SIGN_IN, { replace: true });
    });
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{SETTINGS_MESSAGES.DELETE_DIALOG_TITLE}</AlertDialogTitle>
          <AlertDialogDescription>{SETTINGS_MESSAGES.DELETE_DIALOG_BODY}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 pt-2">
          <Label htmlFor="delete-confirm">{SETTINGS_MESSAGES.DELETE_DIALOG_PHRASE_LABEL}</Label>
          <Input
            autoComplete="off"
            disabled={deleteAccount.isPending}
            id="delete-confirm"
            onChange={(e) => setPhrase(e.target.value)}
            placeholder={SETTINGS_MESSAGES.DELETE_DIALOG_PHRASE_EXPECTED}
            value={phrase}
          />
          {deleteAccount.isError ? (
            <p className="text-sm text-destructive">{SETTINGS_MESSAGES.DELETE_FAILED}</p>
          ) : null}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAccount.isPending}>
            {SETTINGS_MESSAGES.DELETE_DIALOG_CANCEL}
          </AlertDialogCancel>
          <Button
            disabled={!phraseMatches || deleteAccount.isPending}
            onClick={handleConfirm}
            type="button"
            variant="destructive"
          >
            {deleteAccount.isPending
              ? SETTINGS_MESSAGES.DELETE_DIALOG_CONFIRM_BUSY
              : SETTINGS_MESSAGES.DELETE_DIALOG_CONFIRM}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
