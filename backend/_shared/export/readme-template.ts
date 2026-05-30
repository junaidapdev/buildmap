export type ReadmeInput = {
  projectName: string;
  projectDescription: string | null;
  projectType: string | null;
  exportedAt: string;
  counts: {
    contextFiles: number;
    chunks: number;
    featureSpecs: number;
    agentPrompts: number;
    issues: number;
    learnings: number;
  };
};

export function renderReadme(input: ReadmeInput): string {
  const lines: string[] = [];

  lines.push(`# ${input.projectName}`);
  lines.push('');

  if (input.projectDescription) {
    lines.push(input.projectDescription);
    lines.push('');
  }

  if (input.projectType) {
    lines.push(`**Project type:** ${input.projectType}`);
    lines.push('');
  }

  lines.push(`**Exported from SpecForge on ${input.exportedAt}**`);
  lines.push('');

  lines.push("## What's in this folder");
  lines.push('');
  lines.push('- `AGENTS.md` — instructions any AI coding agent should read first.');
  lines.push('- `CLAUDE.md` — Claude-specific implementation partner instructions.');
  lines.push(`- \`context/\` — the orientation documents (${input.counts.contextFiles} files).`);
  lines.push('- `docs/brief.md` — short project brief.');
  lines.push('- `docs/prd.md` — the product requirements document.');
  lines.push('- `docs/architecture.md` — system architecture and key decisions.');
  lines.push(`- \`chunks/\` — ${input.counts.chunks} shippable chunks. Each folder contains:`);
  lines.push('   - `feature-spec.md` — the implementation contract.');
  lines.push(
    '   - `prompt-*.md` — ready-to-paste prompts for Claude Code, Cursor, and generic AI agents.',
  );
  if (input.counts.issues > 0) {
    lines.push(`- \`issues/\` — ${input.counts.issues} captured issue(s) with corrective prompts.`);
  }
  if (input.counts.learnings > 0) {
    lines.push(
      '- `learnings/` — institutional memory: lessons, decisions, gotchas, open questions.',
    );
  }
  lines.push('');

  lines.push('## How to use this');
  lines.push('');
  lines.push('1. Drop `AGENTS.md`, `CLAUDE.md`, and `context/` into the root of your codebase.');
  lines.push('2. Read the architecture and the chunk list to pick your next chunk.');
  lines.push(
    '3. For the chunk you want to ship, open `chunks/{your-chunk}/prompt-*.md` for your AI tool of choice and paste it into the tool.',
  );
  lines.push("4. After shipping, update `context/06-progress-tracker.md` to reflect what's done.");
  lines.push('');

  return lines.join('\n');
}
