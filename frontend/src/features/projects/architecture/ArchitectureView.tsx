import { CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';

import type { ArchitectureContent, ArchitectureSectionKey } from '@shared/schemas/architecture';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { useDownloadMarkdown } from '@/hooks/useDownloadMarkdown';
import { formatRelativeTime } from '@/lib/relative-time';
import { FILENAMES } from '@shared/export/filenames';

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
  const downloadMarkdown = useDownloadMarkdown();
  const content = arch.content_json;
  // Mirror the global is_final into every section's tint. The whole document approves at once;
  // honest visual is all-or-nothing until per-section approval lands.
  const isApproved = arch.is_final;
  const canDownload = arch.content.trim().length > 0;
  const busy = generate.isPending || approve.isPending;

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
    <article className="space-y-6">
      {/*
        Doc toolbar — same shape as the PRD page. Left: version, last-updated, Approved pill.
        Right: Approve / Regenerate all / Export. Per-section Edit + Regenerate live inside each
        ArchitectureSection (icon-only ghost buttons in the section header).
      */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{ARCHITECTURE_MESSAGES.VERSION_LABEL(arch.version)}</Badge>
          {isApproved && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-soft-border bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-text">
              <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
              {ARCHITECTURE_MESSAGES.APPROVED_BADGE}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {ARCHITECTURE_MESSAGES.LAST_UPDATED_PREFIX}{' '}
            {formatRelativeTime(arch.updated_at, ARCHITECTURE_MESSAGES.UPDATED_JUST_NOW)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isApproved && (
            <Button
              aria-busy={approve.isPending}
              disabled={busy}
              onClick={() => approve.mutate()}
              size="sm"
            >
              {approve.isPending
                ? ARCHITECTURE_MESSAGES.APPROVE_BUTTON_BUSY
                : ARCHITECTURE_MESSAGES.APPROVE_BUTTON}
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                aria-busy={generate.isPending}
                disabled={busy}
                size="sm"
                variant="outline"
              >
                <RefreshCw aria-hidden="true" className="h-3.5 w-3.5" />
                {generate.isPending
                  ? ARCHITECTURE_MESSAGES.REGENERATE_BUSY
                  : ARCHITECTURE_MESSAGES.REGENERATE_HEADER_BUTTON}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
                <AlertDialogDescription>
                  {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_BODY}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_CANCEL}
                </AlertDialogCancel>
                <AlertDialogAction onClick={() => generate.mutate()}>
                  {ARCHITECTURE_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            disabled={!canDownload}
            onClick={() =>
              downloadMarkdown({ filename: FILENAMES.architecture(), content: arch.content })
            }
            size="sm"
            variant="outline"
          >
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            {ARCHITECTURE_MESSAGES.EXPORT_HEADER_BUTTON}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <ArchitectureSectionEditor
          isApproved={isApproved}
          label={ARCHITECTURE_MESSAGES.SECTION_STACK_OVERVIEW}
          number={1}
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
          isApproved={isApproved}
          label={ARCHITECTURE_MESSAGES.SECTION_SYSTEM}
          number={2}
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
          isApproved={isApproved}
          label={ARCHITECTURE_MESSAGES.SECTION_COMPONENTS}
          number={3}
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
          isApproved={isApproved}
          label={ARCHITECTURE_MESSAGES.SECTION_DATA_MODEL}
          number={4}
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
          isApproved={isApproved}
          label={ARCHITECTURE_MESSAGES.SECTION_EXTERNAL_SERVICES}
          number={5}
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
          isApproved={isApproved}
          label={ARCHITECTURE_MESSAGES.SECTION_AUTH_SECURITY}
          number={6}
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
          isApproved={isApproved}
          label={ARCHITECTURE_MESSAGES.SECTION_HOSTING}
          number={7}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <ProseEditor onChange={setDraft} value={draft} />}
          renderView={() => <Prose>{content.hosting_and_deployment}</Prose>}
          sectionKey="hosting_and_deployment"
          stitch={(value) => ({ ...content, hosting_and_deployment: value })}
          value={content.hosting_and_deployment}
        />
        {/* Decisions wrapper preserves the #decisions anchor used by overview deep-links. */}
        <div className="scroll-mt-24" id="decisions">
          <ArchitectureSectionEditor
            isApproved={isApproved}
            label={ARCHITECTURE_MESSAGES.SECTION_DECISIONS}
            number={8}
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
          isApproved={isApproved}
          label={ARCHITECTURE_MESSAGES.SECTION_OPEN_QUESTIONS}
          number={9}
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

      {/*
        Footer ribbon. After moving Approve / Regenerate-all / Export into the header toolbar
        above, ArchitectureActions is reduced to the "approved → next: context files" guidance
        banner. Returns null when not yet approved.
      */}
      <ArchitectureActions isFinal={arch.is_final} projectId={projectId} />
    </article>
  );
}
