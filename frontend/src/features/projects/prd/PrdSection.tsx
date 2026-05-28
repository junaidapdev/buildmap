import { type ReactNode } from 'react';

type PrdSectionProps = {
  title: string;
  children: ReactNode;
};

export function PrdSection({ title, children }: PrdSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="text-base leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
