/**
 * Copy for the public landing page at `/`. Brand stays "buildmap" — the canonical product name in
 * use everywhere else in the SPA (sign-in, settings, etc.) and required by the workflow rule in
 * `context/04-ai-workflow-rules.md`.
 *
 * The v2 redesign (off the Claude Design landing handoff) expands the page with:
 *   - 9 deliverables on "What you get" (up from 6), matching the design's full list verbatim.
 *   - "The loop" section with 4 FlowCards each carrying a mini-product preview.
 *   - Hero secondary CTA changes from "Sign in" → "Open a demo" (→ /dashboard).
 *   - Hero gains a ProductPreview mock below the copy.
 *
 * All copy below is pulled directly from the Claude Design handoff README §6.
 */
export const LANDING_MESSAGES = {
  PAGE_TITLE: 'buildmap — Spec-driven project planning for AI builders',

  WORDMARK: 'buildmap',
  BETA_PILL: 'Beta',

  HEADER_SIGN_IN_LINK: 'Sign in',
  HEADER_PRIMARY_CTA: 'Start a project',
  HEADER_NAV: [
    { label: 'How it works', href: '#how' },
    { label: 'What you get', href: '#deliverables' },
    { label: 'The flow', href: '#flow' },
    { label: 'For who', href: '#for' },
  ],

  NEW_PILL: 'NEW',
  NEW_PILL_MESSAGE: 'Knowledge ingestion — paste a transcript, get engineering lessons.',

  HERO_HEADLINE_PRIMARY: 'Plan the project',
  HERO_HEADLINE_SECONDARY: 'so the agent can ship it.',
  HERO_SUBHEAD:
    'buildmap turns a raw idea into a brief, a PRD, an architecture doc, and a queue of small, ship-on-their-own chunks — each one wrapped in a prompt your coding agent can actually execute.',
  HERO_PRIMARY_CTA: 'Start a project',
  HERO_SECONDARY_CTA: 'Open a demo',
  HERO_CHECKS: [
    'Solo-builder workspace',
    'Works with Claude Code, Cursor, Codex',
    'Exports to plain markdown',
  ],

  HOW_TITLE: 'HOW IT WORKS',
  HOW_SUBTITLE: 'From a one-line idea to a folder of agent-ready prompts.',
  HOW_STEPS: [
    {
      number: '01',
      title: 'Clarify',
      body: 'Answer 5 sharp questions the AI asks. Sharpens the idea into a brief.',
    },
    {
      number: '02',
      title: 'Plan',
      body: 'Generate a PRD and an architecture doc. Edit, regenerate, or approve any section.',
    },
    {
      number: '03',
      title: 'Slice',
      body: 'Cut the project into shippable chunks. Each chunk gets a spec.',
    },
    {
      number: '04',
      title: 'Hand off',
      body: "Copy a chunk's prompt into Claude Code or Cursor. Track what's done.",
    },
  ],

  FEATURES_EYEBROW: 'WHAT YOU GET',
  FEATURES_TITLE: 'Twelve outputs, one per project. All as plain markdown.',
  FEATURES_LIST: [
    {
      icon: 'spark',
      title: 'Project brief',
      body: "Top-of-funnel summary. The thing you'd hand to a co-founder over coffee.",
    },
    {
      icon: 'doc',
      title: 'PRD',
      body: "What you're building, for whom, the goals, and the explicit non-goals.",
    },
    {
      icon: 'layers',
      title: 'Architecture',
      body: 'System shape, major components, and a running decision log.',
    },
    {
      icon: 'fileText',
      title: 'Seven context files',
      body: 'PROJECT_OVERVIEW, AGENTS.md, CLAUDE.md, code standards — pasted into your repo.',
    },
    {
      icon: 'kanban',
      title: 'Chunks',
      body: 'Shippable units of work. Reorderable on a Kanban board.',
    },
    {
      icon: 'package',
      title: 'Feature specs',
      body: 'One detailed spec per chunk: context, acceptance, files, tests, out-of-scope.',
    },
    {
      icon: 'terminal',
      title: 'Agent prompts',
      body: 'Ready-to-paste prompt per chunk. Pick Claude Code, Cursor, or generic.',
    },
    {
      icon: 'checkCircle',
      title: 'Progress tracker',
      body: 'Kanban that mirrors back into PROGRESS.md when you sync.',
    },
    {
      icon: 'bug',
      title: 'Issue → prompt',
      body: 'Paste a bug report, get a corrective prompt sized for your agent.',
    },
  ],

  LOOP_EYEBROW: 'THE LOOP',
  LOOP_TITLE: 'Plan → ship a chunk → tracker updates → plan the next one.',
  LOOP_CARDS: {
    clarifier: {
      label: '01 · Clarifier',
      title: 'Five questions, asked one at a time.',
      body:
        'Answer in your own words. The AI digests them into a brief you can approve or rewrite.',
    },
    prd: {
      label: '02 · PRD + Architecture',
      title: 'Long-form documents you can actually edit.',
      body:
        'Every section has Edit, Regenerate, and Approve. Sections you approve get a green corner — you can see the doc tightening.',
    },
    kanban: {
      label: '03 · Chunks board',
      title: 'Drag chunks across columns as they ship.',
      body:
        'Each chunk has a status, effort, and the chunk number that matches the markdown filename. Drag from Backlog to In Progress when you start.',
    },
    prompt: {
      label: '04 · Chunk prompt',
      title: 'Pick your agent. Copy the prompt. Paste it.',
      body:
        'Prompts adapt to Claude Code, Cursor, or a generic shape. The Spec tab is the source of truth — the Prompt tab is a wrapper.',
    },
  },

  FOR_EYEBROW: 'FOR WHO',
  FOR_TITLE: 'Built for one person shipping with an agent.',
  FOR_BODY:
    "No team features. No multiplayer. No Slack integration. buildmap is the missing planning step between \"I have an idea\" and \"Claude Code, please implement chunk 6.\"",
  FOR_BULLETS: [
    'Technical founders prototyping in evenings.',
    'Solo developers who paid for Cursor and feel they’re under-using it.',
    'Designers writing v1 specs before handing to a contract dev.',
    'Indie hackers between projects, who hate the planning gap.',
  ],

  FINAL_CTA_TITLE: 'You already have the idea.',
  FINAL_CTA_BODY:
    'Stop staring at a blank Notion page. Start a buildmap and have a queue of chunks by lunch.',
  FINAL_CTA_PRIMARY: 'Start a project',

  FOOTER_TAGLINE: 'A solo-builder workspace.',
  FOOTER_VERSION: 'v0.1 · made in a quiet room',
} as const;

/** Discriminating string union of supported feature icons (resolved in FeaturesSection). */
export type FeatureIconName =
  (typeof LANDING_MESSAGES.FEATURES_LIST)[number]['icon'];
