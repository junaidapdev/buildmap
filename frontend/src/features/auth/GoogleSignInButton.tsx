import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { authErrorMessage, AUTH_MESSAGES } from '@/features/auth/messages';
import { useAuth } from '@/features/auth/useAuth';

type GoogleSignInButtonProps = {
  onError: (message: string | null) => void;
};

export function GoogleSignInButton({ onError }: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick(): Promise<void> {
    setSubmitting(true);
    onError(null);

    const { error } = await signInWithGoogle();

    if (error) {
      onError(authErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <Button
      className="w-full"
      variant="outline"
      type="button"
      disabled={submitting}
      onClick={() => void handleClick()}
    >
      {submitting ? (
        <LoaderCircle className="animate-spin" aria-hidden="true" />
      ) : (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d="M21.35 11.1h-9.18v3.71h5.28c-.23 1.19-.91 2.2-1.94 2.88v2.4h3.14c1.84-1.69 2.9-4.19 2.9-7.15 0-.64-.06-1.26-.2-1.84Zm-9.18 10.4c2.62 0 4.82-.87 6.43-2.36l-3.14-2.4c-.87.58-1.99.93-3.29.93-2.53 0-4.68-1.71-5.45-4.01H3.48v2.48a9.71 9.71 0 0 0 8.69 5.36Zm-5.45-7.84a5.83 5.83 0 0 1 0-3.66V7.52H3.48a9.71 9.71 0 0 0 0 8.62l3.24-2.48Zm5.45-7.33c1.43 0 2.7.49 3.71 1.45L18.66 5c-1.68-1.57-3.88-2.5-6.49-2.5a9.71 9.71 0 0 0-8.69 5.36L6.72 10c.77-2.3 2.92-3.67 5.45-3.67Z" />
        </svg>
      )}
      {AUTH_MESSAGES.GOOGLE_BUTTON}
    </Button>
  );
}
