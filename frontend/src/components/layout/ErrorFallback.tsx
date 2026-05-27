import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ERROR_MESSAGES } from '@/constants/errors';

type ErrorFallbackProps = {
  onReset: () => void;
};

export function ErrorFallback({ onReset }: ErrorFallbackProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>{ERROR_MESSAGES.RENDER_FAILURE_TITLE}</CardTitle>
          <CardDescription>{ERROR_MESSAGES.RENDER_FAILURE}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Button type="button" onClick={onReset}>
            Try again
          </Button>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}>
            Reload page
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
