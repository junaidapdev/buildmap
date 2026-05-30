/**
 * Copy for the public landing page at `/`. Brand stays "buildmap" — the canonical product name in
 * use everywhere else in the SPA (sign-in, settings, etc.). The chunk spec proposed "SpecForge",
 * but the workflow rule in `context/04-ai-workflow-rules.md` ("Use the current product name,
 * buildmap; do not reintroduce the retired name") and every other surface in the app override the
 * spec on the brand string. The hero headline itself stays as-locked in the spec.
 */
export const LANDING_MESSAGES = {
  PAGE_TITLE: 'buildmap — Spec-driven project planning for AI builders',

  WORDMARK: 'buildmap',

  HEADER_SIGN_IN_LINK: 'Sign in',

  HERO_HEADLINE: 'Plan your project once. Ship it with any AI.',
  HERO_SUBHEAD:
    'buildmap turns a raw idea into PRDs, architecture docs, shippable chunks, and ready-to-paste prompts for Claude Code, Cursor, or any other AI coding tool.',
  HERO_PRIMARY_CTA: 'Get started',
  HERO_SECONDARY_CTA: 'Sign in',

  FEATURES_TITLE: 'What you get',
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
  ],

  FINAL_CTA_TITLE: 'Stop hand-waving. Start with a spec.',
  FINAL_CTA_BODY: 'Sign up and turn your next idea into a plan in minutes.',
  FINAL_CTA_PRIMARY: 'Get started',
} as const;
