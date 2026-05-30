import {
  Bug,
  CircleCheck,
  File,
  FileText,
  KanbanSquare,
  Layers,
  Package,
  Sparkle,
  Terminal,
  type LucideIcon,
} from 'lucide-react';

import { LANDING_MESSAGES, type FeatureIconName } from '@/features/landing/messages';

/** Maps the icon name in `messages.ts` to the actual Lucide icon component. */
const FEATURE_ICON: Record<FeatureIconName, LucideIcon> = {
  spark: Sparkle,
  doc: File,
  layers: Layers,
  fileText: FileText,
  kanban: KanbanSquare,
  package: Package,
  terminal: Terminal,
  checkCircle: CircleCheck,
  bug: Bug,
};

/**
 * §6.4 "What you get" — 3×3 deliverables grid (1 col mobile, 2 col tablet, 3 col desktop). Each
 * tile is a `card` (border + rounded-xl + bg-elevated) with a 30×30 rounded-md icon chip, a 14px
 * tight title, and a 13px muted body. Icon resolved from the per-tile name in messages.ts.
 */
export function FeaturesSection() {
  return (
    <section
      className="mx-auto max-w-6xl border-t border-border-subtle px-6 py-16"
      id="deliverables"
    >
      <div className="mb-9">
        <p className="page-eyebrow">{LANDING_MESSAGES.FEATURES_EYEBROW}</p>
        <h2 className="max-w-2xl text-balance text-[clamp(1.5rem,3.5vw,2rem)] font-semibold leading-tight tracking-tight">
          {LANDING_MESSAGES.FEATURES_TITLE}
        </h2>
      </div>
      <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-3">
        {LANDING_MESSAGES.FEATURES_LIST.map((feature) => {
          const Icon = FEATURE_ICON[feature.icon];
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