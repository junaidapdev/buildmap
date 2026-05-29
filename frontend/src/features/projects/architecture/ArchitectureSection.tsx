import { type ReactNode } from 'react';

type ArchitectureSectionProps = {
  title: string;
  /** Optional right-aligned header slot (e.g. the section's Edit / Regenerate controls). */
  action?: ReactNode;
  children: ReactNode;
};

export function ArchitectureSection({ title, action, children }: ArchitectureSectionProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="text-base leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
