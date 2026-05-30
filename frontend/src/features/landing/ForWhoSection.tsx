import { Check } from 'lucide-react';

import { LANDING_MESSAGES } from '@/features/landing/messages';

/**
 * Audience section — two columns on desktop, stacked on mobile. The left column carries the
 * eyebrow + title + intro + a check-bulleted audience list. The right column would normally hold
 * an example timeline (from the design), but for the MVP it is left empty visually — the
 * left column is the substantive content.
 */
export function ForWhoSection() {
  return (
    <section
      className="mx-auto max-w-6xl border-t border-border-subtle px-6 py-16"
      id="for"
    >
      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <p className="page-eyebrow">{LANDING_MESSAGES.FOR_EYEBROW}</p>
          <h2 className="max-w-xl text-balance text-[clamp(1.625rem,3.6vw,2.25rem)] font-semibold leading-tight tracking-tight">
            {LANDING_MESSAGES.FOR_TITLE}
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-secondaryText">
            {LANDING_MESSAGES.FOR_BODY}
          </p>
          <ul className="mt-6 space-y-2.5">
            {LANDING_MESSAGES.FOR_BULLETS.map((line) => (
              <li className="flex items-start gap-2.5 text-[14px]" key={line}>
                <Check
                  aria-hidden="true"
                  className="mt-[3px] size-3.5 shrink-0 text-brand"
                />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="hidden rounded-xl border bg-card p-7 lg:block">
          <p className="page-eyebrow">Example flow</p>
          <ol className="mt-3 space-y-3.5">
            {[
              { when: 'Tuesday 9pm', body: 'Started Lumen. Answered the five clarifier questions.', meta: 'Brief approved.' },
              { when: 'Tuesday 10pm', body: 'Generated the PRD, edited Goals & Non-goals, approved.', meta: 'PRD 4/6 approved.' },
              { when: 'Wednesday', body: 'Approved the architecture and the decision log.', meta: 'Architecture approved.' },
              { when: 'Thursday', body: 'Sliced into 12 chunks. Started chunk #1.', meta: '1 / 12 shipped.' },
              { when: 'Friday', body: 'Pasted chunk #2 prompt into Claude Code. Shipped.', meta: '2 / 12 shipped.' },
            ].map((entry) => (
              <li className="flex items-start gap-3.5" key={entry.when}>
                <span className="w-[88px] shrink-0 pt-[2px] font-mono text-[11px] text-muted-foreground">
                  {entry.when}
                </span>
                <div className="flex-1">
                  <p className="text-[13px] leading-relaxed">{entry.body}</p>
                  <p className="mt-0.5 text-[12px] text-brand-text">{entry.meta}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </div>
    </section>
  );
}
