import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ERROR_MESSAGES } from '@/constants/errors';
import { ROUTES } from '@/constants/routes';

type NotFoundPageProps = {
  variant: 'signedIn' | 'signedOut';
};

export function NotFoundPage({ variant }: NotFoundPageProps) {
  const signedIn = variant === 'signedIn';

  return (
    <div
      className={
        signedIn
          ? 'flex min-h-96 items-center justify-center'
          : 'flex min-h-screen items-center justify-center bg-background px-4'
      }
    >
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>{ERROR_MESSAGES.PAGE_NOT_FOUND_TITLE}</CardTitle>
          <CardDescription>{ERROR_MESSAGES.PAGE_NOT_FOUND}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to={signedIn ? ROUTES.DASHBOARD : ROUTES.HOME}>
              {signedIn ? 'Go to dashboard' : 'Go home'}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
