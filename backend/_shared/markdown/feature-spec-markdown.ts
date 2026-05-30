import type { FeatureSpecContent } from '@shared/schemas/feature-spec.ts';

/**
 * Deterministically render a feature spec's combined markdown from its structured content. Each
 * section body is already markdown (authored by the AI or edited by the user); this only wraps each
 * with an H2 header in a fixed order. The model also returns a content_markdown, but the Edge
 * Functions discard it and use this renderer so `content` always stays in sync with `content_json`
 * across generation and per-section edits.
 */
export function renderFeatureSpecMarkdown(content: FeatureSpecContent, chunkTitle: string): string {
  const lines: string[] = [`# ${chunkTitle} — Feature Spec`, ''];

  lines.push('## Goal', content.goal, '');
  lines.push('## Scope', content.scope, '');
  lines.push('## Out of Scope', content.out_of_scope, '');
  lines.push('## Technical Requirements', content.technical_requirements, '');
  lines.push('## UI Requirements', content.ui_requirements, '');
  lines.push('## Security Requirements', content.security_requirements, '');
  lines.push('## Acceptance Criteria', content.acceptance_criteria);

  return lines.join('\n');
}
