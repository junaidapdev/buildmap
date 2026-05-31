# buildmap — pre-submission checklist

This document tracks what's been done in Chunk 33 and what still needs manual
verification before submitting.

## Automated (done in Chunk 33)

- [x] `<title>` set in `frontend/index.html` (landing-page fallback).
- [x] `<meta name="description">` set.
- [x] `<meta name="viewport">` set.
- [x] `<meta name="theme-color" content="#0f172a">` set.
- [x] `<html lang="en">` set.
- [x] Open Graph tags set (`og:type`, `og:site_name`, `og:title`, `og:description`,
      `og:image`, `og:image:width`, `og:image:height`, `og:image:alt`).
- [x] Twitter Card tags set (`twitter:card`, `twitter:title`, `twitter:description`,
      `twitter:image`, `twitter:image:alt`).
- [x] Favicon SVG produced at `frontend/public/favicon.svg`.
- [x] Per-route page titles via `useDocumentTitle` on every page component:
  `LandingPage`, `SignInPage` (mode-aware: "Sign in" / "Sign up"),
  `EmailConfirmPage`, `OAuthCallbackPage`, `DashboardPage`, `NewProjectPage`,
  `SettingsPage`, `OverviewPage`, `BriefPage`, `PrdPage`, `ArchitecturePage`,
  `ContextFilesPage`, `ChunksPage`, `ChunkDetailPage`, `ProgressPage`,
  `IssuesListPage`, `IssueDetailPage`, `KnowledgePage`, `ClarifyPage`.

## Manual — you must do these before submitting

### Image assets

- [ ] Produce `frontend/public/favicon-32.png` (32×32 PNG).
- [ ] Produce `frontend/public/favicon-16.png` (16×16 PNG).
- [ ] Produce `frontend/public/apple-touch-icon.png` (180×180 PNG).
- [ ] Produce `frontend/public/og-image.png` (1200×630 PNG, under 200 KB).
- [ ] Delete `frontend/public/PLACEHOLDER-favicon-and-og-image.md` once images
      are in place.

### Production URL and meta

- [ ] After deploy, uncomment and fill in `<meta property="og:url">` in
      `frontend/index.html` with the production URL.
- [ ] Re-deploy after the `og:url` change.

### Verification

- [ ] Visit the production URL in an incognito window — favicon appears in the
      browser tab.
- [ ] Browser tab title reads "buildmap — …" not "Vite + React" or anything
      default.
- [ ] Open browser DevTools Console on a clean load — no errors, no warnings.
- [ ] Paste the production URL into a Slack or Discord DM to yourself — the
      link preview card shows the og-image, title, and description correctly.
- [ ] Use https://www.opengraph.xyz/ to inspect the meta tags on the production
      URL.
- [ ] Lighthouse audit on the landing page — Accessibility and Best Practices
      both 90+.
- [ ] Test on mobile (360px width): landing page, sign-in, dashboard. No
      horizontal scroll. Tap targets adequate.

### Hackathon submission

- [ ] Live demo URL ready.
- [ ] Demo video recorded (60–90 seconds; end-to-end flow).
- [ ] Repository link points to a clean main branch.
- [ ] README updated with one-paragraph pitch, screenshots, tech stack.
- [ ] At least 3 screenshots prepared (landing, chunk board, generated prompt
      with copy button).
- [ ] Tagline consistent across landing page, README, and submission platform.

### Security / hygiene sanity pass

- [ ] `grep -r SUPABASE_SERVICE_ROLE_KEY frontend/` returns zero matches.
- [ ] `grep -r ANTHROPIC_API_KEY frontend/` returns zero matches.
- [ ] `grep -r "sk-ant-" frontend/dist/` (after build) returns zero matches.
- [ ] `grep -r "sk-" frontend/dist/` returns zero matches (or only known false
      positives — e.g., `sk-react`).
- [ ] `grep -rn "console\." frontend/src/` returns only logger files; no stray
      `console.log` in product code.
- [ ] `.env.local` is gitignored; `git ls-files .env.local` returns nothing.

### Auth flow polish

- [ ] In Supabase Auth settings, "Confirm email" is DISABLED for the hackathon
      (so judges don't need to fish for confirmation emails).
- [ ] Reminder to RE-ENABLE confirmation post-hackathon.

### Rate limits

- [ ] Awareness: Chunk 28's rate limits are 200/day global, 20/hour per
      function. If a judge tests aggressively, they may hit the per-function
      cap. Consider temporarily raising limits in
      `backend/_shared/rate-limit/limits.ts` and the matching Postgres function
      — but remember to revert.
