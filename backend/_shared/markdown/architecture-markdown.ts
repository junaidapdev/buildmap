import type {
  ArchitectureContent,
  ArchitectureDecisionStatus,
} from '@shared/schemas/architecture.ts';

function decisionStatusLabel(status: ArchitectureDecisionStatus): string {
  switch (status) {
    case 'proposed':
      return 'Proposed';
    case 'accepted':
      return 'Accepted';
    case 'superseded':
      return 'Superseded';
    case 'rejected':
      return 'Rejected';
  }
}

/**
 * Deterministically render architecture markdown from structured content. The model also returns a
 * `content_markdown`, but the Edge Function discards it and uses this renderer instead, so `content`
 * always stays in sync with `content_json` across generation and (Chunk 16) edits.
 */
export function renderArchitectureMarkdown(
  content: ArchitectureContent,
  projectName: string,
): string {
  const lines: string[] = [`# ${projectName} — Architecture`, ''];

  lines.push('## Stack overview', content.stack_overview, '');

  lines.push('## System', content.system_diagram_text, '');

  lines.push('## Components');
  for (const component of content.components) {
    lines.push(`### ${component.name}`, component.description, '', '**Responsibilities**');
    for (const responsibility of component.responsibilities) {
      lines.push(`- ${responsibility}`);
    }
    lines.push('');
  }

  lines.push('## Data model', content.data_model, '');

  lines.push('## External services');
  if (content.external_services.length === 0) {
    lines.push('_None._', '');
  } else {
    for (const service of content.external_services) {
      lines.push(`### ${service.name}`, service.purpose);
      if (service.notes) {
        lines.push('', service.notes);
      }
      lines.push('');
    }
  }

  lines.push('## Auth & security', content.auth_and_security, '');

  lines.push('## Hosting & deployment', content.hosting_and_deployment, '');

  lines.push('## Decisions');
  if (content.decisions.length === 0) {
    lines.push('_None._', '');
  } else {
    for (const decision of content.decisions) {
      lines.push(
        `### ${decision.title} (${decisionStatusLabel(decision.status)})`,
        '',
        '**Context**',
        decision.context,
        '',
        '**Decision**',
        decision.decision,
        '',
        '**Consequences**',
        decision.consequences,
        '',
      );
    }
  }

  lines.push('## Open questions');
  if (content.open_questions.length === 0) {
    lines.push('_None._', '');
  } else {
    for (const question of content.open_questions) {
      lines.push(`- ${question}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
