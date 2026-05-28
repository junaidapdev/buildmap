import type { PrdContent } from '@shared/schemas/prd.ts';

function priorityLabel(priority: PrdContent['features'][number]['priority']): string {
  switch (priority) {
    case 'must_have':
      return 'Must have';
    case 'should_have':
      return 'Should have';
    case 'nice_to_have':
      return 'Nice to have';
  }
}

/**
 * Deterministically render PRD markdown from structured content. The model is never asked to
 * produce markdown for edits or per-section regenerations — this is the single source of markdown
 * rendering on save, so `content` always stays in sync with `content_json`.
 */
export function renderPrdMarkdown(content: PrdContent, projectName: string): string {
  const lines: string[] = [`# ${projectName} — PRD`, ''];

  lines.push('## Goal', content.goal, '');

  lines.push('## Target users');
  for (const user of content.target_users) {
    lines.push(`- ${user}`);
  }
  lines.push('');

  lines.push('## Problem statement', content.problem_statement, '');

  lines.push('## Success criteria');
  for (const criterion of content.success_criteria) {
    lines.push(`- ${criterion}`);
  }
  lines.push('');

  lines.push('## Features');
  for (const feature of content.features) {
    lines.push(`### ${feature.name} (${priorityLabel(feature.priority)})`, feature.description, '');
  }

  lines.push('## User stories');
  for (const story of content.user_stories) {
    lines.push(`### As a ${story.persona}`, story.story, '', '**Acceptance criteria**');
    for (const criterion of story.acceptance_criteria) {
      lines.push(`- ${criterion}`);
    }
    lines.push('');
  }

  if (content.out_of_scope.length > 0) {
    lines.push('## Out of scope');
    for (const item of content.out_of_scope) {
      lines.push(`- ${item}`);
    }
    lines.push('');
  }

  if (content.open_questions.length > 0) {
    lines.push('## Open questions');
    for (const question of content.open_questions) {
      lines.push(`- ${question}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
