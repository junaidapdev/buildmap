import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

type BriefSectionProps = {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
};

export function BriefSection({ icon: Icon, title, children }: BriefSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <Icon aria-hidden="true" className="h-5 w-5 text-muted-foreground" />
        {title}
      </h2>
      <div className="text-base leading-relaxed text-foreground">{children}</div>
    </section>
  );
}
