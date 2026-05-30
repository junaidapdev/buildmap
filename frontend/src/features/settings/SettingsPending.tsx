import { Skeleton } from '@/components/ui/skeleton';
import { SETTINGS_MESSAGES } from '@/features/settings/messages';

export function SettingsPending() {
  return (
    <div aria-label={SETTINGS_MESSAGES.PENDING_TITLE} className="mx-auto max-w-2xl space-y-8 py-8" role="status">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-36 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
