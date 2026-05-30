import { FileText, Layers, Lightbulb, Rocket } from 'lucide-react';

import { LANDING_MESSAGES } from '@/features/landing/messages';

const STEP_ICONS = [Lightbulb, FileText, Layers, Rocket] as const;

/**
 * Four-step horizontal strip describing the planning loop. Mono numerals + an icon-tile + tight
 * copy per step. The four cells share a single rounded container so the dividers between steps
 * read as continuous shape rather than separate cards.
 */
export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16" id="how">
      <div className="mb-9">
        <p className="page-eyebrow">{LANDING_MESSAGES.HOW_TITLE}</p>
        <h2 className="max-w-2xl text-balance text-[clamp(1.5rem,3.5vw,2rem)] font-semibold leading-tight tracking-tight">
          {LANDING_MESSAGES.HOW_SUBTITLE}
        </h2>
      </div>
      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_MESSAGES.HOW_STEPS.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Lightbulb;
            return (
              <div
                className="border-b border-border-subtle p-7 last:border-b-0 sm:[&:nth-child(2n+1)]:border-r lg:[&:not(:last-child)]:border-r lg:[&:not(:last-child)]:border-b-0 lg:[&:nth-child(2n+1)]:border-b-0"
                key={step.number}
              >
                <p className="mb-4 font-mono text-[11px] text-faint">{step.number}</p>
                <div className="mb-4 grid size-8 place-items-center rounded-md border bg-subtle text-foreground">
                  <Icon aria-hidden="true" className="size-4" />
                </div>
                <h3 className="text-[16px] font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
