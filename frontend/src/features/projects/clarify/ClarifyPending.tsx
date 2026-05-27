import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CLARIFY_MESSAGES } from '@/features/projects/clarify/messages';

export function ClarifyPending() {
  return (
    <section aria-label={CLARIFY_MESSAGES.PENDING_TITLE} className="space-y-6" role="status">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{CLARIFY_MESSAGES.PENDING_TITLE}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{CLARIFY_MESSAGES.PENDING_BODY}</p>
      </div>
      <div aria-hidden="true" className="space-y-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index}>
            <CardContent className="space-y-4 p-5">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
