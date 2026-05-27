import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_CARDS = [1, 2, 3, 4, 5, 6] as const;

export function DashboardSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {SKELETON_CARDS.map((card) => (
        <Card key={card} className="flex min-h-64 flex-col">
          <CardHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="mt-auto">
            <Skeleton className="h-16 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-4 w-24" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
