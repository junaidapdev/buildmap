import type { UserPreferredAgent } from '@shared/schemas/user-profile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SETTINGS_MESSAGES } from '@/features/settings/messages';

const AGENT_OPTIONS = ['claude_code', 'cursor', 'generic'] as const satisfies readonly UserPreferredAgent[];

type Props = {
  preferredAgent: UserPreferredAgent | null;
  onPreferredAgentChange: (value: UserPreferredAgent | null) => void;
};

export function PreferencesSection({ preferredAgent, onPreferredAgentChange }: Props) {
  const selectValue = preferredAgent ?? 'none';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{SETTINGS_MESSAGES.PREFERENCES_TITLE}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Label htmlFor="settings-preferred-agent">{SETTINGS_MESSAGES.PREFERRED_AGENT_LABEL}</Label>
        <Select
          onValueChange={(value) => {
            onPreferredAgentChange(value === 'none' ? null : (value as UserPreferredAgent));
          }}
          value={selectValue}
        >
          <SelectTrigger id="settings-preferred-agent">
            <SelectValue placeholder={SETTINGS_MESSAGES.PREFERRED_AGENT_PLACEHOLDER} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{SETTINGS_MESSAGES.PREFERRED_AGENT_NONE}</SelectItem>
            {AGENT_OPTIONS.map((value) => (
              <SelectItem key={value} value={value}>
                {SETTINGS_MESSAGES.PREFERRED_AGENT_OPTIONS[value]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{SETTINGS_MESSAGES.PREFERRED_AGENT_HELP}</p>
      </CardContent>
    </Card>
  );
}
