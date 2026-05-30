export type IssueExportRow = {
  title: string;
  description: string;
  corrective_prompt: string | null;
  status: string;
  created_at: string;
};

export type LearningExportRow = {
  title: string;
  content: string;
  source_label: string | null;
  created_at: string;
};

export function renderIssueFile(issue: IssueExportRow): string {
  const lines: string[] = [];
  lines.push(`# ${issue.title}`);
  lines.push('');
  lines.push(`**Status:** ${issue.status} · **Created:** ${issue.created_at}`);
  lines.push('');
  lines.push('## Original description');
  lines.push('');
  lines.push(issue.description);
  lines.push('');
  if (issue.corrective_prompt) {
    lines.push('## Corrective prompt');
    lines.push('');
    lines.push(issue.corrective_prompt);
    lines.push('');
  }
  return lines.join('\n');
}

export function renderLearningsFile(
  items: LearningExportRow[],
  type: 'lesson' | 'decision' | 'gotcha' | 'open_question',
): string {
  const typeHeading: Record<typeof type, string> = {
    lesson: 'Lessons',
    decision: 'Decisions',
    gotcha: 'Gotchas',
    open_question: 'Open Questions',
  };
  const lines: string[] = [];
  lines.push(`# ${typeHeading[type]}`);
  lines.push('');
  for (const item of items) {
    lines.push(`## ${item.title}`);
    if (item.source_label) {
      lines.push(`*Source: ${item.source_label}*`);
    }
    lines.push('');
    lines.push(item.content);
    lines.push('');
  }
  return lines.join('\n');
}
