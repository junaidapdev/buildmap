import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';

export function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <section className="w-full max-w-sm rounded-xl border bg-card p-8 text-center text-card-foreground shadow-sm">
        <h1 className="text-3xl font-semibold tracking-tight">buildmap</h1>
        <p className="mt-2 text-sm text-muted-foreground">coming soon</p>
        <Button className="mt-8" onClick={() => logger.info('button clicked')}>
          Hello shadcn
        </Button>
      </section>
    </main>
  );
}
