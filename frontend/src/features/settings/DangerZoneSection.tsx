import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/features/auth/useAuth';
import { DeleteAccountDialog } from '@/features/settings/DeleteAccountDialog';
import { SETTINGS_MESSAGES } from '@/features/settings/messages';

function DangerRow({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

export function DangerZoneSection() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // Chunk 30: post-sign-out redirects land on the public landing page (`/`), not the sign-in
    // form. A returning user can re-enter via the landing page's "Sign in" CTA.
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">{SETTINGS_MESSAGES.DANGER_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DangerRow
            action={
              <Button className="w-full sm:w-auto" onClick={() => void handleSignOut()} variant="outline">
                {SETTINGS_MESSAGES.SIGN_OUT_BUTTON}
              </Button>
            }
            body={SETTINGS_MESSAGES.SIGN_OUT_BODY}
            title={SETTINGS_MESSAGES.SIGN_OUT_TITLE}
          />
          <DangerRow
            action={
              <Button
                className="w-full sm:w-auto"
                onClick={() => setDeleteOpen(true)}
                variant="destructive"
              >
                {SETTINGS_MESSAGES.DELETE_ACCOUNT_BUTTON}
              </Button>
            }
            body={SETTINGS_MESSAGES.DELETE_ACCOUNT_BODY}
            title={SETTINGS_MESSAGES.DELETE_ACCOUNT_TITLE}
          />
        </CardContent>
      </Card>
      <DeleteAccountDialog onOpenChange={setDeleteOpen} open={deleteOpen} />
    </>
  );
}
