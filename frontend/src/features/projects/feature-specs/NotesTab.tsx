import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';

/** Placeholder for a future per-chunk notes surface. */
export function NotesTab() {
  return (
    <div className="rounded-lg border border-dashed p-8 text-center">
      <p className="text-muted-foreground">{FEATURE_SPEC_MESSAGES.NOTES_TAB_PLACEHOLDER}</p>
    </div>
  );
}
