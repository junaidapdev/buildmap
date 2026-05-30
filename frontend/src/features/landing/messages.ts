/**
 * Copy for the public landing page at `/`. Brand stays "buildmap" — the canonical product name in
 * use everywhere else in the SPA (sign-in, settings, etc.). The chunk spec proposed "SpecForge",
 * but the workflow rule in `context/04-ai-workflow-rules.md` ("Use the current product name,
 * buildmap; do not reintroduce the retired name") and every other surface in the app override the
 * spec on the brand string. The hero headline itself stays as-locked in the spec.
 *
 * The design redesign (off the Claude Design handoff) expands the landing with a sticky nav, a
 * NEW pill, twin CTAs, a "How it works" steps row, a "What you get" grid, and an inverted dark
 * final CTA. All copy lives here.
 */
export const LANDING_MESSAGES = {
  PAGE_TITLE: 'buildmap — Spec-driven project planning for AI builders',

  WORDMARK: 'buildmap',
  BETA_PILL: 'Beta',

  HEADER_SIGN_IN_LINK: 'Sign in',
  HEADER_PRIMARY_CTA: 'Get started',
  HEADER_NAV: [
    { label: 'How it works', href: '#how' },
    { label: 'What you get', href: '#deliverables' },
    { label: 'For who', href: '#for' },
  ],

  NEW_PILL: 'NEW',
  NEW_PILL_MESSAGE: 'Knowledge ingestion — paste a transcript, get engineering lessons.',

  HERO_HEADLINE_PRIMARY: 'Plan your project once.',
  HERO_HEADLINE_SECONDARY: 'Ship it with any AI.',
  HERO_SUBHEAD:
    'buildmap turns a raw idea into PRDs, architecture docs, shippable chunks, and ready-to-paste prompts for Claude Code, Cursor, or any other AI coding tool.',
  HERO_PRIMARY_CTA: 'Get started',
  HERO_SECONDARY_CTA: 'Sign in',
  HERO_CHECKS: [
    'Solo-builder workspace',
    'Works with Claude Code, Cursor, Codex',
    'Exports to plain markdown',
  ],

  HOW_TITLE: 'How it works',
  HOW_SUBTITLE: 'From a one-line idea to a folder of agent-ready prompts.',
  HOW_STEPS: [
    {
      number: '01',
      title: 'Clarify',
      body: 'Answer five sharp questions the AI asks. The idea sharpens into a real brief.',
    },
    {
      number: '02',
      title: 'Plan',
      body: 'Generate a PRD and an architecture doc. Edit, regenerate, or approve any section.',
    },
    {
      number: '03',
      title: 'Slice',
      body: 'Cut the project into shippable chunks. Each chunk gets its own implementation spec.',
    },
    {
      number: '04',
      title: 'Hand off',
      body: "Copy a chunk's prompt into Claude Code or Cursor. Track what's done on a board.",
    },
  ],

  FEATURES_EYEBROW: 'WHAT YOU GET',
  FEATURES_TITLE: 'Concrete artifacts, not abstract benefits.',
  FEATURES_LIST: [
    {
      title: 'Clarified ideas, structured plans',
      body:
        'Walk through a short clarifier and end up with a real PRD — goals, users, features, acceptance criteria.',
    },
    {
      title: 'Architecture you can defend',
      body:
        'Generate a system overview, component map, and decision log scoped to your project, not a generic template.',
    },
    {
      title: 'Shippable chunks, not vague tickets',
      body:
        'Your project sliced into small units, each with a feature spec detailed enough for an AI agent to implement.',
    },
    {
      title: 'Agent-ready prompts',
      body:
        'One click produces a complete, copy-pasteable prompt sized for Claude Code, Cursor, or a generic agent.',
    },
    {
      title: 'Progress tracking and exports',
      body:
        'Move chunks through a Kanban board as you ship. Export everything as a ZIP, ready to drop into your codebase.',
    },
    {
      title: 'Issue → corrective prompt',
      body:
        'Paste a bug report, get a focused corrective prompt sized for your agent. The fix becomes part of the spec.',
    },
  ],

  FOR_EYEBROW: 'FOR WHO',
  FOR_TITLE: 'Built for one person shipping with an agent.',
  FOR_BODY:
    "No team features. No multiplayer. No Slack integration. buildmap is the missing planning step between \"I have an idea\" and \"please implement chunk 6.\"",
  FOR_BULLETS: [
    'Technical founders prototyping in evenings.',
    'Solo developers who paid for Cursor and feel they’re under-using it.',
    'Designers writing v1 specs before handing to a contract dev.',
    'Indie hackers between projects, who hate the planning gap.',
  ],

  FINAL_CTA_TITLE: 'You already have the idea.',
  FINAL_CTA_BODY:
    'Stop staring at a blank Notion page. Start a buildmap and have a queue of chunks by lunch.',
  FINAL_CTA_PRIMARY: 'Get started',

  FOOTER_TAGLINE: 'A solo-builder workspace.',
  FOOTER_VERSION: 'v0.1 · made in a quiet room',
} as const;