# buildmap UI Context

## Visual Style

- Tone: clean, serious, professional SaaS workspace; neither playful nor corporate-stuffy.
- Reference points: Linear, the Vercel dashboard, and Notion.
- Avoid trendy gradients, oversized marketing hero text, and neumorphism inside the application.
- Density is comfortable, not cramped or excessively airy. Use Tailwind's default spacing scale.

## Color System

- Use shadcn/ui CSS-variable theming with `slate` as the default base color.
- Light theme is the default. Dark theme is supported and becomes toggleable in a later UI chunk.
- Never hardcode hex colors in components. Use semantic Tailwind tokens such as
  `bg-background`, `text-foreground`, and `border-border`.
- Status colors use accessible Tailwind roles: success uses `green-600` in light theme and
  `green-500` in dark theme; warning uses `amber-600` / `amber-500`; error uses
  `red-600` / `red-500`; info uses `blue-600` / `blue-500`.
- Chunk statuses (`Backlog`, `Ready`, `In Progress`, `Needs Review`, `Completed`, and `Blocked`)
  receive distinct accessible semantic color tokens in `tailwind.config.ts` when the chunk board
  is implemented in Chunk 19.

## Typography

- Use Tailwind's system sans-serif defaults, with Inter as the preferred web font once the first
  feature page introduces it through `index.html`.
- Use Tailwind's default type scale: `text-sm` for body text, `text-base` for primary content,
  and `text-lg`, `text-xl`, or `text-2xl` for headings.
- Use `leading-relaxed` for long-form PRD and architecture content and `leading-normal`
  elsewhere.
- Render code in monospace `<code>` or `<pre>` blocks, slightly smaller than surrounding body
  text when appropriate.

## Layout Rules

- Use `max-w-6xl` for dashboards and document workspaces.
- Use `max-w-3xl` for forms and reading-heavy pages such as PRDs and architecture documents.
- The application sidebar is `w-64`, collapsible to `w-16`, when implemented in Chunk 06 or
  Chunk 11.
- Prefer `gap-*` and Tailwind spacing-scale classes; avoid arbitrary spacing values.
- Use CSS grid for boards such as the Chunk 19 board and flexbox for ordinary layouts.

## Component Behavior

- Use shadcn `<Button>` for actions, with one primary action per view and outlined or ghost
  variants for secondary actions.
- Forms use shadcn form primitives and Zod-based validation, displaying inline errors beneath
  fields.
- Use shadcn `<Dialog>` for ordinary modals and `<AlertDialog>` for destructive confirmations.
- Use shadcn `<Toast>` for transient feedback such as save or copy confirmation, not for
  actionable failures a user must resolve.
- Use shadcn `<Table>` for tabular information. Add `@tanstack/react-table` only if a later
  feature genuinely requires sorting or filtering and records the dependency decision.
- Use shadcn `<Skeleton>` for known loading shapes and a spinner only when the eventual layout is
  unknown.

## Required States Per Page

Every major page or component explicitly handles four states: **Loading** (skeleton or spinner),
**Empty** (description and a clear next action), **Error** (friendly message and recovery when
relevant), and **Success / Default** (the actual content).

- **Loading:** Do not show a blank screen; show a skeleton or appropriate spinner.
- **Empty:** Pair an icon or illustration with one sentence and a clear action, such as
  "Create your first project."
- **Error:** Use copy from `frontend/src/constants/errors.ts`, include retry where relevant, and
  offer a support path when retry cannot help.
- **Success / Default:** Render the working content and its primary next action.

These states are required for feature pages. The Chunk 01 home page is a static scaffold
verification screen, not a completed feature workflow.

## Accessibility

- Every interactive element must be keyboard-navigable.
- Keep visible focus rings; do not remove shadcn focus treatment without an accessible
  replacement.
- Never communicate status using color alone; combine color with text or an icon.
- Associate every form input with a label.
- Give every button an accessible name through visible text or `aria-label`.
- Use modal components that trap focus while open and restore it on close; shadcn primitives
  provide this behavior.

## Copy & Tone

- Use direct, plain English without marketing fluff in application UI.
- Use verb-first action labels: "Create project", "Generate PRD", and "Mark complete".
- Empty states address the user and state the next step, for example: "You don't have any
  projects yet. Create your first one to get started."
- Error copy is honest without exposing infrastructure details: "We couldn't generate the PRD.
  Try again, or check your connection." Never surface provider status text directly.

## Things to Avoid

- Animated splash screens or marketing hero sections inside the application.
- Gradient content backgrounds.
- Tooltips that conceal information required to complete an action.
- Nested modal flows.
- Disabled buttons without an inline explanation or accessible tooltip describing why.
- Non-critical toasts that persist longer than about five seconds, or critical errors that
  disappear automatically.
