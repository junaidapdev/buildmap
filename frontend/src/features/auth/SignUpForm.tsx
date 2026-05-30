import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton';
import { AUTH_MESSAGES, authErrorMessage } from '@/features/auth/messages';
import { SignUpSchema, type SignUpInput } from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/useAuth';

type FieldErrors = Partial<Record<keyof SignUpInput, string>>;

type SignUpFormProps = {
  /** Switches the parent tab UI to the sign-in pane. */
  onRequestSignIn: () => void;
};

/**
 * Sign-up form body, extracted from the legacy SignUpPage so the tabbed auth surface (Chunk 30)
 * can mount either this or SignInForm without duplicating the layout chrome. Validation, error
 * mapping, and the post-submit "Check your email" confirmation state are unchanged from Chunk 05.
 */
export function SignUpForm({ onRequestSignIn }: SignUpFormProps) {
  const { loading, signUpWithPassword } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);

    const result = SignUpSchema.safeParse({
      displayName: displayName.trim() || undefined,
      email,
      password,
    });

    if (!result.success) {
      const errors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (
          (field === 'displayName' || field === 'email' || field === 'password') &&
          !errors[field]
        ) {
          errors[field] = issue.message;
        }
      }

      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    const { error } = await signUpWithPassword(
      result.data.email,
      result.data.password,
      result.data.displayName,
    );
    setSubmitting(false);

    if (error) {
      setErrorMessage(authErrorMessage(error));
      return;
    }

    setEmailSent(true);
  }

  // "Check your email" confirmation overlays the form so the tab UI stays usable but the success
  // state is unmistakable. Returning to the sign-in tab clears it on tab switch through the
  // parent's onValueChange.
  if (emailSent) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>{AUTH_MESSAGES.EMAIL_SENT_TITLE}</CardTitle>
          <CardDescription>{AUTH_MESSAGES.EMAIL_SENT_BODY}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Button onClick={onRequestSignIn} type="button" variant="outline">
            {AUTH_MESSAGES.TO_SIGN_IN_LINK}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <GoogleSignInButton onError={setErrorMessage} />
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs uppercase text-muted-foreground">{AUTH_MESSAGES.OR_DIVIDER}</span>
        <Separator className="flex-1" />
      </div>
      <form className="space-y-4" noValidate onSubmit={(event) => void handleSubmit(event)}>
        <div className="space-y-2">
          <Label htmlFor="sign-up-name">{AUTH_MESSAGES.DISPLAY_NAME_LABEL}</Label>
          <Input
            aria-describedby={fieldErrors.displayName ? 'sign-up-name-error' : undefined}
            aria-invalid={Boolean(fieldErrors.displayName)}
            autoComplete="name"
            id="sign-up-name"
            name="displayName"
            onChange={(event) => setDisplayName(event.target.value)}
            type="text"
            value={displayName}
          />
          {fieldErrors.displayName && (
            <p className="text-sm text-destructive" id="sign-up-name-error" role="alert">
              {fieldErrors.displayName}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-up-email">{AUTH_MESSAGES.EMAIL_LABEL}</Label>
          <Input
            aria-describedby={fieldErrors.email ? 'sign-up-email-error' : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            id="sign-up-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
          {fieldErrors.email && (
            <p className="text-sm text-destructive" id="sign-up-email-error" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-up-password">{AUTH_MESSAGES.PASSWORD_LABEL}</Label>
          <Input
            aria-describedby={fieldErrors.password ? 'sign-up-password-error' : undefined}
            aria-invalid={Boolean(fieldErrors.password)}
            autoComplete="new-password"
            id="sign-up-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          {fieldErrors.password && (
            <p className="text-sm text-destructive" id="sign-up-password-error" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>
        <Button className="w-full" disabled={submitting || loading} type="submit">
          {submitting && <LoaderCircle aria-hidden="true" className="animate-spin" />}
          {AUTH_MESSAGES.SIGN_UP_BUTTON}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <span>{AUTH_MESSAGES.TO_SIGN_IN}</span>{' '}
        <button
          className="font-medium text-foreground underline-offset-4 hover:underline"
          onClick={onRequestSignIn}
          type="button"
        >
          {AUTH_MESSAGES.TO_SIGN_IN_LINK}
        </button>
      </p>
    </div>
  );
}
