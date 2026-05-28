import { type ReactNode } from 'react';

type ArchitectureSectionProps = {
  title: string;
  children: ReactNode;
};

export function ArchitectureSection({ title, children }: ArchitectureSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="text-base leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
