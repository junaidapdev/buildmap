import { useState } from 'react';

import type { UserPreferredAgent, UserProfileRow } from '@shared/schemas/user-profile';
import { Button } from '@/components/ui/button';
import { AccountSection } from '@/features/settings/AccountSection';
import { DangerZoneSection } from '@/features/settings/DangerZoneSection';
import { PreferencesSection } from '@/features/settings/PreferencesSection';
import { SETTINGS_MESSAGES } from '@/features/settings/messages';
import { SettingsError } from '@/features/settings/SettingsError';
import { SettingsPending } from '@/features/settings/SettingsPending';
import { useUpdateUserProfile } from '@/features/settings/useUpdateUserProfile';
import { useUserProfile } from '@/features/settings/useUserProfile';
import { useDocumentTitle } from '@/lib/document-title';

function SettingsForm({ profile }: { profile: UserProfileRow }) {
  const updateMutation = useUpdateUserProfile();
  const [displayName, setDisplayName] = useState(profile.display_name ?? '');
  const [preferredAgent, setPreferredAgent] = useState<UserPreferredAgent | null>(
    profile.default_preferred_agent,
  );
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const isDirty =
    displayName !== (profile.display_name ?? '') ||
    preferredAgent !== profile.default_preferred_agent;

  const handleSave = () => {
    setShowSaveSuccess(false);
    updateMutation.mutate(
      { displayName, defaultPreferredAgent: preferredAgent },
      {
        onSuccess: () => {
          setShowSaveSuccess(true);
        },
      },
    );
  };

  return (
    <>
      <AccountSection
        displayName={displayName}
        onDisplayNameChange={setDisplayName}
        profile={profile}
      />

      <PreferencesSection
        onPreferredAgentChange={setPreferredAgent}
        preferredAgent={preferredAgent}
      />

      <div className="flex flex-col items-end gap-2">
        <Button
          className="w-full sm:w-auto"
          disabled={!isDirty || updateMutation.isPending}
          onClick={handleSave}
          type="button"
        >
          {updateMutation.isPending
            ? SETTINGS_MESSAGES.SAVE_BUTTON_BUSY
            : SETTINGS_MESSAGES.SAVE_BUTTON}
        </Button>
        {showSaveSuccess && updateMutation.isSuccess ? (
          <p className="text-sm text-muted-foreground">{SETTINGS_MESSAGES.SAVE_SUCCESS}</p>
        ) : null}
        {updateMutation.isError ? (
          <p className="text-sm text-destructive">{SETTINGS_MESSAGES.SAVE_FAILED}</p>
        ) : null}
      </div>
    </>
  );
}

export function SettingsPage() {
  useDocumentTitle('Settings — buildmap');

  const profileQuery = useUserProfile();

  if (profileQuery.isPending) {
    return <SettingsPending />;
  }

  if (profileQuery.isError || !profileQuery.data) {
    return <SettingsError onRetry={() => void profileQuery.refetch()} />;
  }

  const profile = profileQuery.data;

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-8">
      <header>
        <h1 className="text-2xl font-semibold">{SETTINGS_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-1 text-muted-foreground">{SETTINGS_MESSAGES.PAGE_SUBTITLE}</p>
      </header>

      <SettingsForm key={profile.updated_at} profile={profile} />

      <DangerZoneSection />
    </div>
  );
}
