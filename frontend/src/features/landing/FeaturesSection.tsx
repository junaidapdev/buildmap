import { LANDING_MESSAGES } from '@/features/landing/messages';

/**
 * Five concrete features. Mobile = 1 column, tablet = 2 columns, desktop = 3 columns. No icons —
 * the page is intentionally text-driven (icon selection is a design rabbit hole and adds no
 * meaning at this layer). Border-top separates from the hero.
 */
export function FeaturesSection() {
  return (
    <section className="mx-auto max-w-4xl border-t px-6 py-16">
      <h2 className="mb-12 text-center text-2xl font-semibold">
        {LANDING_MESSAGES.FEATURES_TITLE}
      </h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {LANDING_MESSAGES.FEATURES_LIST.map((feature) => (
          <article className="space-y-2" key={feature.title}>
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
