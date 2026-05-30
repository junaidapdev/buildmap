import { type ReactNode } from 'react';

import {
  ClarifierMini,
  KanbanMini,
  PrdMini,
  PromptMini,
} from '@/features/landing/FlowMinis';
import { LANDING_MESSAGES } from '@/features/landing/messages';

type FlowCardProps = {
  label: string;
  title: string;
  body: string;
  preview: ReactNode;
};

/**
 * One FlowCard inside The Loop. Two-block card: a top text block (mono label + 18px title +
 * muted body), then a divider, then the bg-subtle preview block holding the mini-mock. The
 * preview block has a minimum height so the four cards line up visually even when the mocks
 * differ in size.
 */
function FlowCard({ label, title, body, preview }: FlowCardProps) {
  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="px-6 pb-4 pt-5">
        <p className="mb-3 font-mono text-[11px] text-faint">{label}</p>
        <h3 className="text-[18px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-[13px] leading-[1.55] text-muted-foreground">{body}</p>
      </div>
      <div className="min-h-[220px] border-t border-border-subtle bg-subtle p-5">{preview}</div>
    </article>
  );
}

/**
 * §6.5 "The loop" — 2×2 grid of FlowCards each illustrating one step of the planning-shipping
 * loop with a small live-DOM mock of the actual product surface. Together they communicate
 * "buildmap looks like a real tool, not a marketing page."
 */
export function TheLoopSection() {
  const cards = [
    {
      label: LANDING_MESSAGES.LOOP_CARDS.clarifier.label,
      title: LANDING_MESSAGES.LOOP_CARDS.clarifier.title,
      body: LANDING_MESSAGES.LOOP_CARDS.clarifier.body,
      preview: <ClarifierMini />,
    },
    {
      label: LANDING_MESSAGES.LOOP_CARDS.prd.label,
      title: LANDING_MESSAGES.LOOP_CARDS.prd.title,
      body: LANDING_MESSAGES.LOOP_CARDS.prd.body,
      preview: <PrdMini />,
    },
    {
      label: LANDING_MESSAGES.LOOP_CARDS.kanban.label,
      title: LANDING_MESSAGES.LOOP_CARDS.kanban.title,
      body: LANDING_MESSAGES.LOOP_CARDS.kanban.body,
      preview: <KanbanMini />,
    },
    {
      label: LANDING_MESSAGES.LOOP_CARDS.prompt.label,
      title: LANDING_MESSAGES.LOOP_CARDS.prompt.title,
      body: LANDING_MESSAGES.LOOP_CARDS.prompt.body,
      preview: <PromptMini />,
    },
  ];

  return (
    <section
      className="mx-auto max-w-6xl border-t border-border-subtle px-6 py-16"
      id="flow"
    >
      <div className="mb-9">
        <p className="page-eyebrow">{LANDING_MESSAGES.LOOP_EYEBROW}</p>
        <h2 className="max-w-2xl text-balance text-[clamp(1.5rem,3.5vw,2rem)] font-semibold leading-tight tracking-tight">
          {LANDING_MESSAGES.LOOP_TITLE}
        </h2>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {cards.map((card) => (
          <FlowCard
            body={card.body}
            key={card.label}
            label={card.label}
            preview={card.preview}
            title={card.title}
          />
        ))}
      </div>
    </section>
  );
}
