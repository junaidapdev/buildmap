import {
  Ban,
  Layers,
  Lightbulb,
  PlayCircle,
  Rocket,
  ShieldAlert,
  Target,
  Users,
} from 'lucide-react';

import type { ProjectBriefContent } from '@shared/schemas/brief';
import { Badge } from '@/components/ui/badge';
import { BriefActions } from '@/features/projects/brief/BriefActions';
import { BriefSection } from '@/features/projects/brief/BriefSection';
import { BRIEF_MESSAGES } from '@/features/projects/brief/messages';
import { useApproveBrief } from '@/features/projects/brief/useApproveBrief';
import type { BriefRow } from '@/features/projects/brief/useExistingBrief';
import { useGenerateBrief } from '@/features/projects/brief/useGenerateBrief';
import { formatRelativeTime } from '@/lib/relative-time';

type BriefViewProps = {
  brief: BriefRow;
  projectId: string;
};

function renderList(items: readonly string[]) {
  if (items.length === 0) {
    return <p className="text-muted-foreground">{BRIEF_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <ul className="ml-5 list-disc space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function renderTechStack(stack: ProjectBriefContent['initialTechStack']) {
  if (!stack) {
    return <p className="text-muted-foreground">{BRIEF_MESSAGES.EMPTY_LIST}</p>;
  }

  const rows: { label: string; value: string }[] = [];

  if (stack.frontend) rows.push({ label: BRIEF_MESSAGES.TECH_FRONTEND, value: stack.frontend });
  if (stack.backend) rows.push({ label: BRIEF_MESSAGES.TECH_BACKEND, value: stack.backend });
  if (stack.database) rows.push({ label: BRIEF_MESSAGES.TECH_DATABASE, value: stack.database });
  if (stack.hosting) rows.push({ label: BRIEF_MESSAGES.TECH_HOSTING, value: stack.hosting });
  if (stack.ai) rows.push({ label: BRIEF_MESSAGES.TECH_AI, value: stack.ai });
  if (stack.other && stack.other.length > 0) {
    rows.push({ label: BRIEF_MESSAGES.TECH_OTHER, value: stack.other.join(', ') });
  }

  const techAssumptions = stack.assumptions ?? [];

  if (rows.length === 0 && techAssumptions.length === 0) {
    return <p className="text-muted-foreground">{BRIEF_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <div className="space-y-4">
      {rows.length > 0 && (
        <dl className="space-y-2">
          {rows.map((row) => (
            <div
              className="grid grid-cols-1 gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4"
              key={row.label}
            >
              <dt className="font-medium text-muted-foreground">{row.label}</dt>
              <dd className="text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {techAssumptions.length > 0 && (
        <div>
          <p className="mb-1 text-sm font-medium text-muted-foreground">
            {BRIEF_MESSAGES.SECTION_ASSUMPTIONS}
          </p>
          {renderList(techAssumptions)}
        </div>
      )}
    </div>
  );
}

export function BriefView({ brief, projectId }: BriefViewProps) {
  const generate = useGenerateBrief(projectId);
  const approve = useApproveBrief(projectId);
  const content = brief.content_json;

  return (
    <article className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{BRIEF_MESSAGES.VERSION_LABEL(brief.version)}</Badge>
        <span className="text-xs text-muted-foreground">
          {BRIEF_MESSAGES.LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(brief.updated_at, BRIEF_MESSAGES.UPDATED_JUST_NOW)}
        </span>
      </div>

      <div className="space-y-8">
        <BriefSection icon={Target} title={BRIEF_MESSAGES.SECTION_PROBLEM}>
          <p>{content.problemStatement}</p>
        </BriefSection>
        <BriefSection icon={Users} title={BRIEF_MESSAGES.SECTION_USER}>
          <p>{content.targetUser}</p>
        </BriefSection>
        <BriefSection icon={PlayCircle} title={BRIEF_MESSAGES.SECTION_USE_CASE}>
          <p>{content.coreUseCase}</p>
        </BriefSection>
        <BriefSection icon={Rocket} title={BRIEF_MESSAGES.SECTION_MVP}>
          <p>{content.mvpGoal}</p>
        </BriefSection>
        <BriefSection icon={Ban} title={BRIEF_MESSAGES.SECTION_OUT_OF_SCOPE}>
          {renderList(content.outOfScope)}
        </BriefSection>
        <BriefSection icon={ShieldAlert} title={BRIEF_MESSAGES.SECTION_RISKS}>
          {renderList(content.keyRisks)}
        </BriefSection>
        <BriefSection icon={Layers} title={BRIEF_MESSAGES.SECTION_TECH}>
          {renderTechStack(content.initialTechStack)}
        </BriefSection>
        {content.assumptions && content.assumptions.length > 0 && (
          <BriefSection icon={Lightbulb} title={BRIEF_MESSAGES.SECTION_ASSUMPTIONS}>
            {renderList(content.assumptions)}
          </BriefSection>
        )}
      </div>

      <BriefActions
        isApproving={approve.isPending || generate.isPending}
        isFinal={brief.is_final}
        isRegenerating={generate.isPending || approve.isPending}
        onApprove={() => approve.mutate()}
        onRegenerate={() => generate.mutate({})}
        projectId={projectId}
      />
    </article>
  );
}
