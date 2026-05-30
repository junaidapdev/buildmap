import { useCallback, useState } from 'react';

import type { ArchitectureContent, ArchitectureSectionKey } from '@shared/schemas/architecture';
import { Badge } from '@/components/ui/badge';
import { ProseEditor } from '@/features/projects/_shared/edit/editors/ProseEditor';
import { StringListEditor } from '@/features/projects/_shared/edit/editors/StringListEditor';
import { useDirtyGuard } from '@/features/projects/_shared/edit/useDirtyGuard';
import { ArchitectureActions } from '@/features/projects/architecture/ArchitectureActions';
import { ArchitectureComponentCard } from '@/features/projects/architecture/ArchitectureComponentCard';
import { ArchitectureDecisionCard } from '@/features/projects/architecture/ArchitectureDecisionCard';
import { ArchitectureExternalServiceCard } from '@/features/projects/architecture/ArchitectureExternalServiceCard';
import { ArchitectureSectionEditor } from '@/features/projects/architecture/edit/ArchitectureSectionEditor';
import { ComponentListEditor } from '@/features/projects/architecture/edit/editors/ComponentListEditor';
import { DecisionListEditor } from '@/features/projects/architecture/edit/editors/DecisionListEditor';
import { ExternalServiceListEditor } from '@/features/projects/architecture/edit/editors/ExternalServiceListEditor';
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

function renderComponents(components: ArchitectureContent['components']) {
  if (components.length === 0) {
    return <EmptyList />;
  }

  return (
    <div className="space-y-3">
      {components.map((component) => (
        <ArchitectureComponentCard component={component} key={component.id} />
      ))}
    </div>
  );
}

function renderServices(services: ArchitectureContent['external_services']) {
  if (services.length === 0) {
    return <EmptyList />;
  }

  return (
    <div className="space-y-3">
      {services.map((service) => (
        <ArchitectureExternalServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}

function renderDecisions(decisions: ArchitectureContent['decisions']) {
  if (decisions.length === 0) {
    return <EmptyList />;
  }

  return (
    <div className="space-y-3">
      {decisions.map((decision) => (
        <ArchitectureDecisionCard decision={decision} key={decision.id} />
      ))}
    </div>
  );
}

function renderQuestions(questions: ArchitectureContent['open_questions']) {
  if (questions.length === 0) {
    return <EmptyList />;
  }

  return (
    <ul className="ml-5 list-disc space-y-1">
      {questions.map((question, index) => (
        <li key={index}>{question}</li>
      ))}
    </ul>
  );
}

export function ArchitectureView({ arch, projectId }: ArchitectureViewProps) {
  const generate = useGenerateArchitecture(projectId);
  const approve = useApproveArchitecture(projectId);
  const content = arch.content_json;

  const [dirtyMap, setDirtyMap] = useState<Partial<Record<ArchitectureSectionKey, boolean>>>({});
  const anyDirty = Object.values(dirtyMap).some(Boolean);
  useDirtyGuard(anyDirty);

  const handleDirtyChange = useCallback((sectionKey: ArchitectureSectionKey, dirty: boolean) => {
    setDirtyMap((previous) =>
      previous[sectionKey] === dirty ? previous : { ...previous, [sectionKey]: dirty },
    );
  }, []);

  // Saving invalidates the architecture query, so the refetched row updates this view.
  const handleSaved = useCallback(() => {}, []);

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
        <ArchitectureSectionEditor
          label={ARCHITECTURE_MESSAGES.SECTION_STACK_OVERVIEW}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <ProseEditor onChange={setDraft} value={draft} />}
          renderView={() => <Prose>{content.stack_overview}</Prose>}
          sectionKey="stack_overview"
          stitch={(value) => ({ ...content, stack_overview: value })}
          value={content.stack_overview}
        />
        <ArchitectureSectionEditor
          label={ARCHITECTURE_MESSAGES.SECTION_SYSTEM}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <ProseEditor onChange={setDraft} value={draft} />}
          renderView={() => <Prose>{content.system_diagram_text}</Prose>}
          sectionKey="system_diagram_text"
          stitch={(value) => ({ ...content, system_diagram_text: value })}
          value={content.system_diagram_text}
        />
        <ArchitectureSectionEditor
          label={ARCHITECTURE_MESSAGES.SECTION_COMPONENTS}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => (
            <ComponentListEditor onChange={setDraft} value={draft} />
          )}
          renderView={() => renderComponents(content.components)}
          sectionKey="components"
          stitch={(value) => ({ ...content, components: value })}
          value={content.components}
        />
        <ArchitectureSectionEditor
          label={ARCHITECTURE_MESSAGES.SECTION_DATA_MODEL}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <ProseEditor onChange={setDraft} value={draft} />}
          renderView={() => <Prose>{content.data_model}</Prose>}
          sectionKey="data_model"
          stitch={(value) => ({ ...content, data_model: value })}
          value={content.data_model}
        />
        <ArchitectureSectionEditor
          label={ARCHITECTURE_MESSAGES.SECTION_EXTERNAL_SERVICES}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => (
            <ExternalServiceListEditor onChange={setDraft} value={draft} />
          )}
          renderView={() => renderServices(content.external_services)}
          sectionKey="external_services"
          stitch={(value) => ({ ...content, external_services: value })}
          value={content.external_services}
        />
        <ArchitectureSectionEditor
          label={ARCHITECTURE_MESSAGES.SECTION_AUTH_SECURITY}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <ProseEditor onChange={setDraft} value={draft} />}
          renderView={() => <Prose>{content.auth_and_security}</Prose>}
          sectionKey="auth_and_security"
          stitch={(value) => ({ ...content, auth_and_security: value })}
          value={content.auth_and_security}
        />
        <ArchitectureSectionEditor
          label={ARCHITECTURE_MESSAGES.SECTION_HOSTING}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <ProseEditor onChange={setDraft} value={draft} />}
          renderView={() => <Prose>{content.hosting_and_deployment}</Prose>}
          sectionKey="hosting_and_deployment"
          stitch={(value) => ({ ...content, hosting_and_deployment: value })}
          value={content.hosting_and_deployment}
        />
        <div className="scroll-mt-24" id="decisions">
          <ArchitectureSectionEditor
            label={ARCHITECTURE_MESSAGES.SECTION_DECISIONS}
            onDirtyChange={handleDirtyChange}
            onSaved={handleSaved}
            projectId={projectId}
            renderEditor={(draft, setDraft) => (
              <DecisionListEditor onChange={setDraft} projectId={projectId} value={draft} />
            )}
            renderView={() => renderDecisions(content.decisions)}
            sectionKey="decisions"
            stitch={(value) => ({ ...content, decisions: value })}
            value={content.decisions}
          />
        </div>
        <ArchitectureSectionEditor
          label={ARCHITECTURE_MESSAGES.SECTION_OPEN_QUESTIONS}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <StringListEditor onChange={setDraft} value={draft} />}
          renderView={() => renderQuestions(content.open_questions)}
          sectionKey="open_questions"
          stitch={(value) => ({ ...content, open_questions: value })}
          value={content.open_questions}
        />
      </div>

      <ArchitectureActions
        content={arch.content}
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
