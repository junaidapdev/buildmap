import { Badge } from '@/components/ui/badge';
import { ArchitectureActions } from '@/features/projects/architecture/ArchitectureActions';
import { ArchitectureComponentCard } from '@/features/projects/architecture/ArchitectureComponentCard';
import { ArchitectureDecisionCard } from '@/features/projects/architecture/ArchitectureDecisionCard';
import { ArchitectureExternalServiceCard } from '@/features/projects/architecture/ArchitectureExternalServiceCard';
import { ArchitectureSection } from '@/features/projects/architecture/ArchitectureSection';
import { ARCHITECTURE_MESSAGES } from '@/features/projects/architecture/messages';
import { useApproveArchitecture } from '@/features/projects/architecture/useApproveArchitecture';
import type { ArchitectureRow } from '@/features/projects/architecture/useExistingArchitecture';
import { useGenerateArchitecture } from '@/features/projects/architecture/useGenerateArchitecture';
import { formatRelativeTime } from '@/lib/relative-time';

type ArchitectureViewProps = {
  arch: ArchitectureRow;
  projectId: string;
};

function Prose({ children }: { children: string }) {
  return <p className="whitespace-pre-line">{children}</p>;
}

function EmptyList() {
  return <p className="text-muted-foreground">{ARCHITECTURE_MESSAGES.EMPTY_LIST}</p>;
}

export function ArchitectureView({ arch, projectId }: ArchitectureViewProps) {
  const generate = useGenerateArchitecture(projectId);
  const approve = useApproveArchitecture(projectId);
  const content = arch.content_json;

  return (
    <article className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{ARCHITECTURE_MESSAGES.VERSION_LABEL(arch.version)}</Badge>
        <span className="text-xs text-muted-foreground">
          {ARCHITECTURE_MESSAGES.LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(arch.updated_at, ARCHITECTURE_MESSAGES.UPDATED_JUST_NOW)}
        </span>
      </div>

      <div className="space-y-8">
        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_STACK_OVERVIEW}>
          <Prose>{content.stack_overview}</Prose>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_SYSTEM}>
          <Prose>{content.system_diagram_text}</Prose>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_COMPONENTS}>
          {content.components.length === 0 ? (
            <EmptyList />
          ) : (
            <div className="space-y-3">
              {content.components.map((component) => (
                <ArchitectureComponentCard component={component} key={component.id} />
              ))}
            </div>
          )}
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_DATA_MODEL}>
          <Prose>{content.data_model}</Prose>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_EXTERNAL_SERVICES}>
          {content.external_services.length === 0 ? (
            <EmptyList />
          ) : (
            <div className="space-y-3">
              {content.external_services.map((service) => (
                <ArchitectureExternalServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_AUTH_SECURITY}>
          <Prose>{content.auth_and_security}</Prose>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_HOSTING}>
          <Prose>{content.hosting_and_deployment}</Prose>
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_DECISIONS}>
          {content.decisions.length === 0 ? (
            <EmptyList />
          ) : (
            <div className="space-y-3">
              {content.decisions.map((decision) => (
                <ArchitectureDecisionCard decision={decision} key={decision.id} />
              ))}
            </div>
          )}
        </ArchitectureSection>

        <ArchitectureSection title={ARCHITECTURE_MESSAGES.SECTION_OPEN_QUESTIONS}>
          {content.open_questions.length === 0 ? (
            <EmptyList />
          ) : (
            <ul className="ml-5 list-disc space-y-1">
              {content.open_questions.map((question, index) => (
                <li key={index}>{question}</li>
              ))}
            </ul>
          )}
        </ArchitectureSection>
      </div>

      <ArchitectureActions
        isApproving={approve.isPending}
        isFinal={arch.is_final}
        isRegenerating={generate.isPending}
        onApprove={() => approve.mutate()}
        onRegenerate={() => generate.mutate()}
        projectId={projectId}
      />
    </article>
  );
}
