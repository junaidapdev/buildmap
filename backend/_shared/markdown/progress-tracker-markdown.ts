import type { ChunkEffort, ChunkStatus } from '@shared/schemas/chunks.ts';

/** Subset of feature_chunks needed for the rendered markdown. Loose intentionally — the SPA wires it. */
export type ProgressChunkSummary = {
  ref: string | null;
  title: string;
  description: string;
  status: ChunkStatus;
  estimated_effort: ChunkEffort;
  position: number;
};

export type ProgressTrackerRenderInput = {
  projectName: string;
  projectStatus: string;
  chunks: ProgressChunkSummary[];
  /** ISO-8601 timestamp. Sliced to YYYY-MM-DD in the meta line so the doc stays diff-friendly. */
  generatedAt: string;
};

const STATUS_LABELS: Record<ChunkStatus, string> = {
  backlog: 'Backlog',
  ready: 'Ready',
  in_progress: 'In progress',
  needs_review: 'Needs review',
  completed: 'Completed',
  blocked: 'Blocked',
};

const EFFORT_LABELS: Record<ChunkEffort, string> = {
  xs: 'XS',
  s: 'S',
  m: 'M',
  l: 'L',
  xl: 'XL',
};

/** Render order for the per-status sections — actionable groups first, finished work last. */
const SECTION_ORDER: readonly ChunkStatus[] = [
  'in_progress',
  'needs_review',
  'blocked',
  'ready',
  'backlog',
  'completed',
];

function countByStatus(chunks: ProgressChunkSummary[]): Record<ChunkStatus, number> {
  const counts: Record<ChunkStatus, number> = {
    backlog: 0,
    ready: 0,
    in_progress: 0,
    needs_review: 0,
    completed: 0,
    blocked: 0,
  };
  for (const chunk of chunks) {
    counts[chunk.status] += 1;
  }
  return counts;
}

function isoDate(iso: string): string {
  // Slice instead of parsing so the function stays pure: the input is already an ISO timestamp.
  // Falls back to the raw value if the caller passed something non-ISO (defensive but not strict).
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

/**
 * Deterministically render the Progress Tracker context file's markdown from live chunk state.
 * Pure — same input always produces identical output. Used by the SPA on "Sync to markdown" to
 * overwrite the `progress_tracker` context-file row via update_context_file_content.
 *
 * Sections appear in priority order and are omitted when empty. Chunk descriptions are inserted
 * verbatim from feature_chunks.description; the renderer trusts the caller to have run them through
 * the project's normal validation (the SPA reads RLS-scoped rows that already passed Zod).
 */
export function renderProgressTrackerMarkdown(input: ProgressTrackerRenderInput): string {
  const { projectName, projectStatus, chunks, generatedAt } = input;
  const lines: string[] = [`# ${projectName} — Progress Tracker`, ''];

  lines.push(`*Project status: \`${projectStatus}\` · Synced: ${isoDate(generatedAt)}*`, '');

  const counts = countByStatus(chunks);
  lines.push('## Overview', '');
  lines.push(`- Total chunks: ${chunks.length}`);
  lines.push(`- ${STATUS_LABELS.completed}: ${counts.completed}`);
  lines.push(`- ${STATUS_LABELS.in_progress}: ${counts.in_progress}`);
  lines.push(`- ${STATUS_LABELS.needs_review}: ${counts.needs_review}`);
  lines.push(`- ${STATUS_LABELS.backlog}: ${counts.backlog}`);
  lines.push(`- ${STATUS_LABELS.ready}: ${counts.ready}`);
  lines.push(`- ${STATUS_LABELS.blocked}: ${counts.blocked}`);
  lines.push('');

  for (const status of SECTION_ORDER) {
    const inGroup = chunks
      .filter((chunk) => chunk.status === status)
      .sort((a, b) => a.position - b.position);
    if (inGroup.length === 0) {
      continue;
    }
    lines.push(`## ${STATUS_LABELS[status]}`, '');
    for (const chunk of inGroup) {
      const refSuffix = chunk.ref ? ` (\`${chunk.ref}\`)` : '';
      lines.push(`- **${chunk.title}**${refSuffix} — ${EFFORT_LABELS[chunk.estimated_effort]}`);
      lines.push(`  ${chunk.description}`);
    }
    lines.push('');
  }

  lines.push('## Notes for next agent', '');
  if (chunks.length === 0) {
    lines.push('- No chunks generated yet.');
  } else if (counts.completed === chunks.length) {
    lines.push('- All chunks are complete. Project is ready for release or follow-up work.');
  } else if (counts.in_progress > 0) {
    lines.push('- Continue with the current in-progress chunk(s) before starting new ones.');
  } else if (counts.needs_review > 0) {
    lines.push('- Resolve the chunks waiting for review, then move on.');
  } else if (counts.blocked > 0 && counts.in_progress === 0) {
    lines.push('- Unblock the blocked chunk(s) or pick a different chunk from the backlog.');
  } else {
    lines.push('- Pick the next chunk and move it to In progress.');
  }
  lines.push('');

  return lines.join('\n');
}
