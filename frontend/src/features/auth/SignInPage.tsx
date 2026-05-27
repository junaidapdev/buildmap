import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ROUTES } from '@/constants/routes';
import { GoogleSignInButton } from '@/features/auth/GoogleSignInButton';
import { authErrorMessage, AUTH_MESSAGES } from '@/features/auth/messages';
import { SignInSchema, type SignInInput } from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/useAuth';

type FieldErrors = Partial<Record<keyof SignInInput, string>>;

function destinationFromState(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('from' in state)) {
    return ROUTES.DASHBOARD;
  }

  return typeof state.from === 'string' ? state.from : ROUTES.DASHBOARD;
}

export function SignInPage() {
  const { loading, session, signInWithPassword } = useAuth();
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

  if (!loading && session && !submitting) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{AUTH_MESSAGES.SIGN_IN_TITLE}</CardTitle>
          <CardDescription>{AUTH_MESSAGES.SIGN_IN_SUBTITLE}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <GoogleSignInButton onError={setErrorMessage} />
          <div className="flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase text-muted-foreground">
              {AUTH_MESSAGES.OR_DIVIDER}
            </span>
            <Separator className="flex-1" />
          </div>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="sign-in-email">{AUTH_MESSAGES.EMAIL_LABEL}</Label>
              <Input
                id="sign-in-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'sign-in-email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="sign-in-email-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sign-in-password">{AUTH_MESSAGES.PASSWORD_LABEL}</Label>
              <Input
                id="sign-in-password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'sign-in-password-error' : undefined}
              />
              {fieldErrors.password && (
                <p id="sign-in-password-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <Button className="w-full" type="submit" disabled={submitting || loading}>
              {submitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {AUTH_MESSAGES.SIGN_IN_BUTTON}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          <span>{AUTH_MESSAGES.TO_SIGN_UP}</span>
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            to={ROUTES.SIGN_UP}
          >
            {AUTH_MESSAGES.TO_SIGN_UP_LINK}
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
