import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SETTINGS_MESSAGES } from '@/features/settings/messages';
import type { UserProfileRow } from '@shared/schemas/user-profile';

type Props = {
  profile: UserProfileRow;
  displayName: string;
  onDisplayNameChange: (value: string) => void;
};

export function AccountSection({ profile, displayName, onDisplayNameChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{SETTINGS_MESSAGES.ACCOUNT_TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="settings-email">{SETTINGS_MESSAGES.EMAIL_LABEL}</Label>
          <Input
            className="bg-muted"
            id="settings-email"
            readOnly
            value={profile.email}
          />
          <p className="text-sm text-muted-foreground">{SETTINGS_MESSAGES.EMAIL_HELP}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="settings-display-name">{SETTINGS_MESSAGES.DISPLAY_NAME_LABEL}</Label>
          <Input
            id="settings-display-name"
            onChange={(e) => onDisplayNameChange(e.target.value)}
            placeholder={SETTINGS_MESSAGES.DISPLAY_NAME_PLACEHOLDER}
            value={displayName}
          />
          <p className="text-sm text-muted-foreground">{SETTINGS_MESSAGES.DISPLAY_NAME_HELP}</p>
        </div>
      </CardContent>
    </Card>
  );
}
