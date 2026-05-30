import type { FeatureSpecSectionKey } from '@shared/schemas/feature-spec';

import { FEATURE_SPEC_MESSAGES } from '@/features/projects/feature-specs/messages';

/** Fixed top-to-bottom order of the seven spec sections. Single source for iteration order. */
export const FEATURE_SPEC_SECTION_ORDER: readonly FeatureSpecSectionKey[] = [
  'goal',
  'scope',
  'out_of_scope',
  'technical_requirements',
  'ui_requirements',
  'security_requirements',
  'acceptance_criteria',
];

export const FEATURE_SPEC_SECTION_LABELS: Record<FeatureSpecSectionKey, string> = {
  goal: FEATURE_SPEC_MESSAGES.SECTION_GOAL,
  scope: FEATURE_SPEC_MESSAGES.SECTION_SCOPE,
  out_of_scope: FEATURE_SPEC_MESSAGES.SECTION_OUT_OF_SCOPE,
  technical_requirements: FEATURE_SPEC_MESSAGES.SECTION_TECHNICAL,
  ui_requirements: FEATURE_SPEC_MESSAGES.SECTION_UI,
  security_requirements: FEATURE_SPEC_MESSAGES.SECTION_SECURITY,
  acceptance_criteria: FEATURE_SPEC_MESSAGES.SECTION_ACCEPTANCE,
};
