import {
  Bug,
  FileText,
  KanbanSquare,
  Layers,
  Sparkles,
  Terminal,
  type LucideIcon,
} from 'lucide-react';

import { LANDING_MESSAGES } from '@/features/landing/messages';

const FEATURE_ICONS: readonly LucideIcon[] = [
  Sparkles,
  Layers,
  KanbanSquare,
  Terminal,
  FileText,
  Bug,
];

/**
 * Concrete artifact tiles. Mobile = 1 column, tablet = 2 columns, desktop = 3 columns. Each tile
 * gets a small icon chip and a tight title + body. Border-top separator from the prior section.
 */
export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl border-t border-border-subtle px-6 py-16" id="deliverables">
      <div className="mb-9">
        <p className="page-eyebrow">{LANDING_MESSAGES.FEATURES_EYEBROW}</p>
        <h2 className="max-w-2xl text-balance text-[clamp(1.5rem,3.5vw,2rem)] font-semibold leading-tight tracking-tight">
          {LANDING_MESSAGES.FEATURES_TITLE}
        </h2>
      </div>
      <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {LANDING_MESSAGES.FEATURES_LIST.map((feature, index) => {
          const Icon = FEATURE_ICONS[index] ?? Sparkles;
          return (
            <article
              className="rounded-xl border bg-card p-5 transition-colors hover:border-border-strong"
              key={feature.title}
            >
              <div className="mb-3 grid size-[30px] place-items-center rounded-md border bg-subtle text-secondaryText">
                <Icon aria-hidden="true" className="size-[15px]" />
              </div>
              <h3 className="text-[14px] font-semibold tracking-tight">{feature.title}</h3>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                {feature.body}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}