import { ArrowRight, Check, Copy } from 'lucide-react';

import { Button } from '@/components/ui/button';

/**
 * The four mini-previews embedded inside the "The Loop" FlowCards. Each is a small static DOM
 * mock matching the design's signature pattern of "real product UI" rather than stock imagery.
 * All copy and structure lifted from the Claude Design handoff §8.
 *
 * Marked `aria-hidden` because they're decorative — the surrounding FlowCard already carries the
 * meaningful label/title/body.
 */

/** Step 01 — clarifier question with progress + sample answer. */
export function ClarifierMini() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <div className="grid size-[22px] place-items-center rounded-full bg-foreground text-[11px] font-semibold text-background">
          3
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">QUESTION 3 OF 5</span>
        <div className="flex-1" />
        <div className="relative h-1 w-20 overflow-hidden rounded-sm bg-border">
          <span className="absolute inset-y-0 left-0 w-[60%] bg-brand" />
        </div>
      </div>
      <p className="text-[14px] font-medium leading-[1.35] text-foreground">
        What&apos;s the one moment that has to feel magical?
      </p>
      <p className="min-h-[64px] rounded-lg border bg-elevated p-2.5 text-[12px] leading-[1.45] text-secondaryText">
        The Sunday morning email lands and surfaces a highlight I forgot I&apos;d captured on
        Wednesday — and it actually makes me want to revisit the chapter.
      </p>
      <div className="flex justify-end gap-1.5">
        <Button className="h-7 px-2.5 text-[12px]" size="sm" variant="ghost">
          Back
        </Button>
        <Button
          className="h-7 bg-brand px-2.5 text-[12px] text-brand-on hover:bg-brand-hover"
          size="sm"
        >
          Next
          <ArrowRight aria-hidden="true" className="size-3" />
        </Button>
      </div>
    </div>
  );
}

/** Step 02 — three PRD sections, two approved (green) + one draft with kbd hint. */
export function PrdMini() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2">
      {[
        { title: 'Problem', approved: true },
        { title: 'Target user', approved: true },
        { title: 'Goals & non-goals', approved: false },
      ].map((section) => (
        <div
          className={`rounded-lg border px-3 py-2.5 ${
            section.approved
              ? 'border-status-done-border bg-status-done-bg'
              : 'border-border bg-elevated'
          }`}
          key={section.title}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[12px] font-semibold ${
                section.approved ? 'text-status-done-fg' : 'text-foreground'
              }`}
            >
              {section.title}
            </span>
            {section.approved ? (
              <span className="inline-flex h-[18px] items-center gap-1 rounded-full border border-status-done-border bg-status-done-bg px-2 text-[10px] font-medium text-status-done-fg">
                <Check aria-hidden="true" className="size-2.5" />
                Approved
              </span>
            ) : (
              <div className="flex gap-1">
                <span className="inline-flex h-[18px] items-center rounded-full border bg-subtle px-2 text-[10px] font-medium text-secondaryText">
                  Draft
                </span>
                <span className="kbd" style={{ fontSize: 9, height: 18, padding: '1px 4px' }}>
                  R
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Step 03 — condensed two-column board (In progress / Done). */
export function KanbanMini() {
  const columns = [
    { title: 'In progress', count: 2, cards: ['#6 Timer', '#7 Highlight paste'] },
    { title: 'Done', count: 5, cards: ['#5 Streak', '#4 Daily log'] },
  ] as const;

  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-2">
      {columns.map((column) => (
        <div key={column.title}>
          <div className="flex justify-between px-1 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
            <span>{column.title}</span>
            <span>{column.count}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {column.cards.map((card) => (
              <div
                className="rounded-[7px] border bg-elevated px-2.5 py-2 text-[11px] text-foreground"
                key={card}
              >
                {card}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Step 04 — agent target tabs + mono prompt body + copy button. */
export function PromptMini() {
  const targets = [
    { label: 'Claude Code', active: true },
    { label: 'Cursor', active: false },
    { label: 'Generic', active: false },
  ] as const;

  return (
    <div aria-hidden="true" className="flex flex-col gap-2.5">
      <div className="flex gap-1">
        {targets.map((target) => (
          <span
            className={`rounded-md border px-2.5 py-[5px] text-[11px] ${
              target.active
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-transparent text-muted-foreground'
            }`}
            key={target.label}
          >
            {target.label}
          </span>
        ))}
      </div>
      <div className="rounded-lg border bg-background p-2.5 font-mono text-[10.5px] leading-[1.5] text-secondaryText">
        You are working in the Lumen repository. Read PROJECT_OVERVIEW.md, AGENTS.md, and CLAUDE.md
        first.
        <br />
        <br />
        You have been assigned chunk #6:{' '}
        <span className="text-foreground">Reading session timer</span>…
      </div>
      <Button
        className="h-7 self-start px-2.5 text-[12px]"
        size="sm"
        type="button"
        variant="outline"
      >
        <Copy aria-hidden="true" className="size-3" />
        Copy prompt
      </Button>
    </div>
  );
}
