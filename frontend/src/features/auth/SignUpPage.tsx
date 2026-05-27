import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';

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
import { SignUpSchema, type SignUpInput } from '@/features/auth/schemas';
import { useAuth } from '@/features/auth/useAuth';

type FieldErrors = Partial<Record<keyof SignUpInput, string>>;

export function SignUpPage() {
  const { loading, session, signUpWithPassword } = useAuth();
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

  if (emailSent) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>{AUTH_MESSAGES.EMAIL_SENT_TITLE}</CardTitle>
            <CardDescription>{AUTH_MESSAGES.EMAIL_SENT_BODY}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild variant="outline">
              <Link to={ROUTES.SIGN_IN}>{AUTH_MESSAGES.TO_SIGN_IN_LINK}</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  if (!loading && session) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>{AUTH_MESSAGES.SIGN_UP_TITLE}</CardTitle>
          <CardDescription>{AUTH_MESSAGES.SIGN_UP_SUBTITLE}</CardDescription>
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
              <Label htmlFor="sign-up-name">{AUTH_MESSAGES.DISPLAY_NAME_LABEL}</Label>
              <Input
                id="sign-up-name"
                name="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                aria-invalid={Boolean(fieldErrors.displayName)}
                aria-describedby={fieldErrors.displayName ? 'sign-up-name-error' : undefined}
              />
              {fieldErrors.displayName && (
                <p id="sign-up-name-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sign-up-email">{AUTH_MESSAGES.EMAIL_LABEL}</Label>
              <Input
                id="sign-up-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'sign-up-email-error' : undefined}
              />
              {fieldErrors.email && (
                <p id="sign-up-email-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sign-up-password">{AUTH_MESSAGES.PASSWORD_LABEL}</Label>
              <Input
                id="sign-up-password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'sign-up-password-error' : undefined}
              />
              {fieldErrors.password && (
                <p id="sign-up-password-error" className="text-sm text-destructive" role="alert">
                  {fieldErrors.password}
                </p>
              )}
            </div>
            <Button className="w-full" type="submit" disabled={submitting || loading}>
              {submitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {AUTH_MESSAGES.SIGN_UP_BUTTON}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center gap-1 text-sm text-muted-foreground">
          <span>{AUTH_MESSAGES.TO_SIGN_IN}</span>
          <Link
            className="font-medium text-foreground underline-offset-4 hover:underline"
            to={ROUTES.SIGN_IN}
          >
            {AUTH_MESSAGES.TO_SIGN_IN_LINK}
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
