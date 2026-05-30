import { Button } from '@/components/ui/button';
import { SETTINGS_MESSAGES } from '@/features/settings/messages';

type Props = {
  onRetry: () => void;
};

export function SettingsError({ onRetry }: Props) {
  return (
    <div className="mx-auto max-w-2xl py-8 text-center">
      <h2 className="text-lg font-semibold">{SETTINGS_MESSAGES.ERROR_TITLE}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{SETTINGS_MESSAGES.ERROR_BODY}</p>
      <Button className="mt-6" onClick={onRetry} type="button" variant="outline">
        {SETTINGS_MESSAGES.ERROR_RETRY}
      </Button>
    </div>
  );
}
