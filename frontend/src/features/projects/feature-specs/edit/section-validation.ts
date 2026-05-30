import { FeatureSpecContentSchema, type FeatureSpecSectionKey } from '@shared/schemas/feature-spec';

import { FEATURE_SPEC_EDIT_MESSAGES } from '@/features/projects/feature-specs/edit/messages';

/** Reads a numeric property off an issue defensively, tolerating number or bigint (Zod minimum/maximum). */
function readNumber(source: object, key: string): number | null {
  const value = (source as Record<string, unknown>)[key];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return null;
}

/**
 * Validates one spec section's draft string against its slice of the shared schema and returns a
 * friendly, field-level message (or null when valid). Lets the editor disable Save and explain why
 * instead of failing opaquely on save (feature_spec_save_invalid_local). Each section is a single
 * markdown string, so it validates against `FeatureSpecContentSchema.shape[sectionKey]`.
 */
export function getFeatureSpecSectionIssue(
  draft: string,
  sectionKey: FeatureSpecSectionKey,
  sectionLabel: string,
): string | null {
  const result = FeatureSpecContentSchema.shape[sectionKey].safeParse(draft);
  if (result.success) {
    return null;
  }

  const issue = result.error.issues[0];
  if (!issue) {
    return null;
  }

  if (issue.code === 'too_small') {
    const min = readNumber(issue, 'minimum') ?? 1;
    return `${sectionLabel} ${FEATURE_SPEC_EDIT_MESSAGES.VALIDATION_TOO_SHORT(min)}`;
  }
  if (issue.code === 'too_big') {
    const max = readNumber(issue, 'maximum') ?? 0;
    return `${sectionLabel} ${FEATURE_SPEC_EDIT_MESSAGES.VALIDATION_TOO_LONG(max)}`;
  }
  return `${sectionLabel} ${FEATURE_SPEC_EDIT_MESSAGES.VALIDATION_INVALID}`;
}
