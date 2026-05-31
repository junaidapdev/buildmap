import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROUTES } from '@/constants/routes';
import { AUTH_MESSAGES, authErrorMessage } from '@/features/auth/messages';
import { SignInSchema, type SignInInput } from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/useAuth';

type FieldErrors = Partial<Record<keyof SignInInput, string>>;

type SignInFormProps = {
  /** Switches the parent tab UI to the sign-up pane. */
  onRequestSignUp: () => void;
};

function destinationFromState(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return ROUTES.DASHBOARD;
  }

  return typeof state.from === 'string' ? state.from : ROUTES.DASHBOARD;
}

/**
 * Sign-in form body, extracted from the legacy SignInPage so the tabbed auth surface (Chunk 30)
 * can mount either this or SignUpForm without duplicating the layout chrome. Validation, error
 * mapping, and post-success navigation are unchanged from Chunk 05.
 */
export function SignInForm({ onRequestSignUp }: SignInFormProps) {
  const { loading, signInWithPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);

    const result = SignInSchema.safeParse({ email, password });

    if (!result.success) {
      const errors: FieldErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if ((field === 'email' || field === 'password') && !errors[field]) {
          errors[field] = issue.message;
        }
      }

      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    const { error } = await signInWithPassword(result.data.email, result.data.password);
    setSubmitting(false);

    if (error) {
      setErrorMessage(authErrorMessage(error));
      return;
    }

    navigate(destinationFromState(location.state), { replace: true });
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <form className="space-y-4" noValidate onSubmit={(event) => void handleSubmit(event)}>
        <div className="space-y-2">
          <Label htmlFor="sign-in-email">{AUTH_MESSAGES.EMAIL_LABEL}</Label>
          <Input
            aria-describedby={fieldErrors.email ? 'sign-in-email-error' : undefined}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
            id="sign-in-email"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
          {fieldErrors.email && (
            <p className="text-sm text-destructive" id="sign-in-email-error" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sign-in-password">{AUTH_MESSAGES.PASSWORD_LABEL}</Label>
          <Input
            aria-describedby={fieldErrors.password ? 'sign-in-password-error' : undefined}
            aria-invalid={Boolean(fieldErrors.password)}
            autoComplete="current-password"
            id="sign-in-password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
          {fieldErrors.password && (
            <p className="text-sm text-destructive" id="sign-in-password-error" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>
        <Button className="w-full" disabled={submitting || loading} type="submit">
          {submitting && <LoaderCircle aria-hidden="true" className="animate-spin" />}
          {AUTH_MESSAGES.SIGN_IN_BUTTON}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        <span>{AUTH_MESSAGES.TO_SIGN_UP}</span>{' '}
        <button
          className="font-medium text-foreground underline-offset-4 hover:underline"
          onClick={onRequestSignUp}
          type="button"
        >
          {AUTH_MESSAGES.TO_SIGN_UP_LINK}
        </button>
      </p>
    </div>
  );
}
