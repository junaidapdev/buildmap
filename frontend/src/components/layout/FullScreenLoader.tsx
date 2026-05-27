import { Skeleton } from '@/components/ui/skeleton';

export function FullScreenLoader() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-background px-4"
      aria-label="Loading application"
    >
      <div className="w-full max-w-sm space-y-3" role="status">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </main>
  );
}
