import { CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { useCallback, useState } from 'react';

import type { PrdContent, PrdSectionKey } from '@shared/schemas/prd';
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
import { PrdActions } from '@/features/projects/prd/PrdActions';
import { PrdFeatureCard } from '@/features/projects/prd/PrdFeatureCard';
import { PrdUserStoryCard } from '@/features/projects/prd/PrdUserStoryCard';
import { PrdSectionEditor } from '@/features/projects/prd/edit/PrdSectionEditor';
import { ProseEditor } from '@/features/projects/_shared/edit/editors/ProseEditor';
import { StringListEditor } from '@/features/projects/_shared/edit/editors/StringListEditor';
import { useDirtyGuard } from '@/features/projects/_shared/edit/useDirtyGuard';
import { FeatureListEditor } from '@/features/projects/prd/edit/editors/FeatureListEditor';
import { UserStoryListEditor } from '@/features/projects/prd/edit/editors/UserStoryListEditor';
import { PRD_MESSAGES } from '@/features/projects/prd/messages';
import { useApprovePrd } from '@/features/projects/prd/useApprovePrd';
import type { PrdRow } from '@/features/projects/prd/useExistingPrd';
import { useGeneratePrd } from '@/features/projects/prd/useGeneratePrd';
import { useDownloadMarkdown } from '@/hooks/useDownloadMarkdown';
import { formatRelativeTime } from '@/lib/relative-time';
import { FILENAMES } from '@shared/export/filenames';

type PrdViewProps = {
  prd: PrdRow;
  projectId: string;
};

function renderList(items: readonly string[]) {
  if (items.length === 0) {
    return <p className="text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <ul className="ml-5 list-disc space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function renderFeatures(features: PrdContent['features']) {
  if (features.length === 0) {
    return <p className="text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {features.map((feature) => (
        <PrdFeatureCard feature={feature} key={feature.id} />
      ))}
    </div>
  );
}

function renderStories(stories: PrdContent['user_stories']) {
  if (stories.length === 0) {
    return <p className="text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>;
  }

  return (
    <div className="space-y-3">
      {stories.map((story) => (
        <PrdUserStoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}

export function PrdView({ prd, projectId }: PrdViewProps) {
  const generate = useGeneratePrd(projectId);
  const approve = useApprovePrd(projectId);
  const downloadMarkdown = useDownloadMarkdown();
  const content = prd.content_json;
  // Mirror the global is_final into every section's tint. The mockup shows per-section approval,
  // but the backend approves the PRD as a whole; honest visual is all-or-nothing.
  const isApproved = prd.is_final;
  const canDownload = prd.content.trim().length > 0;
  const busy = generate.isPending || approve.isPending;

  const [dirtyMap, setDirtyMap] = useState<Partial<Record<PrdSectionKey, boolean>>>({});
  const anyDirty = Object.values(dirtyMap).some(Boolean);
  useDirtyGuard(anyDirty);

  const handleDirtyChange = useCallback((sectionKey: PrdSectionKey, dirty: boolean) => {
    setDirtyMap((previous) =>
      previous[sectionKey] === dirty ? previous : { ...previous, [sectionKey]: dirty },
    );
  }, []);

  // Saving invalidates the PRD query, so the refetched row updates this view; nothing to do here.
  const handleSaved = useCallback(() => {}, []);

  return (
    <article className="space-y-6">
      {/*
        Doc toolbar. Left side carries the version + last-updated meta and (when applicable) the
        Approved status pill so the doc-level state is visible at a glance. Right side pulls the
        page's primary actions (Approve / Regenerate all / Export) out of the bottom and into the
        header rhythm matching the mockup. Page-level controls only — per-section Edit/Regenerate
        live inside each PrdSection.
      */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline">{PRD_MESSAGES.VERSION_LABEL(prd.version)}</Badge>
          {isApproved && (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-brand-soft-border bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand-text">
              <CheckCircle2 aria-hidden="true" className="h-3 w-3" />
              {PRD_MESSAGES.APPROVED_BADGE}
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {PRD_MESSAGES.LAST_UPDATED_PREFIX}{' '}
            {formatRelativeTime(prd.updated_at, PRD_MESSAGES.UPDATED_JUST_NOW)}
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
                ? PRD_MESSAGES.APPROVE_BUTTON_BUSY
                : PRD_MESSAGES.APPROVE_BUTTON}
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
                  ? PRD_MESSAGES.REGENERATE_BUSY
                  : PRD_MESSAGES.REGENERATE_HEADER_BUTTON}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{PRD_MESSAGES.REGENERATE_CONFIRM_TITLE}</AlertDialogTitle>
                <AlertDialogDescription>
                  {PRD_MESSAGES.REGENERATE_CONFIRM_BODY}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{PRD_MESSAGES.REGENERATE_CONFIRM_CANCEL}</AlertDialogCancel>
                <AlertDialogAction onClick={() => generate.mutate()}>
                  {PRD_MESSAGES.REGENERATE_CONFIRM_CONFIRM}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            disabled={!canDownload}
            onClick={() => downloadMarkdown({ filename: FILENAMES.prd(), content: prd.content })}
            size="sm"
            variant="outline"
          >
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            {PRD_MESSAGES.EXPORT_HEADER_BUTTON}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <PrdSectionEditor
          isApproved={isApproved}
          label={PRD_MESSAGES.SECTION_GOAL}
          number={1}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          prdContent={content}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <ProseEditor onChange={setDraft} value={draft} />}
          renderView={() => <p>{content.goal}</p>}
          sectionKey="goal"
          stitch={(value) => ({ ...content, goal: value })}
          value={content.goal}
        />
        <PrdSectionEditor
          isApproved={isApproved}
          label={PRD_MESSAGES.SECTION_TARGET_USERS}
          number={2}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          prdContent={content}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <StringListEditor onChange={setDraft} value={draft} />}
          renderView={() => renderList(content.target_users)}
          sectionKey="target_users"
          stitch={(value) => ({ ...content, target_users: value })}
          value={content.target_users}
        />
        <PrdSectionEditor
          isApproved={isApproved}
          label={PRD_MESSAGES.SECTION_PROBLEM}
          number={3}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          prdContent={content}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <ProseEditor onChange={setDraft} value={draft} />}
          renderView={() => <p>{content.problem_statement}</p>}
          sectionKey="problem_statement"
          stitch={(value) => ({ ...content, problem_statement: value })}
          value={content.problem_statement}
        />
        <PrdSectionEditor
          isApproved={isApproved}
          label={PRD_MESSAGES.SECTION_SUCCESS_CRITERIA}
          number={4}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          prdContent={content}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <StringListEditor onChange={setDraft} value={draft} />}
          renderView={() => renderList(content.success_criteria)}
          sectionKey="success_criteria"
          stitch={(value) => ({ ...content, success_criteria: value })}
          value={content.success_criteria}
        />
        <PrdSectionEditor
          isApproved={isApproved}
          label={PRD_MESSAGES.SECTION_FEATURES}
          number={5}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          prdContent={content}
          projectId={projectId}
          renderEditor={(draft, setDraft) => (
            <FeatureListEditor onChange={setDraft} value={draft} />
          )}
          renderView={() => renderFeatures(content.features)}
          sectionKey="features"
          stitch={(value) => ({ ...content, features: value })}
          value={content.features}
        />
        <PrdSectionEditor
          isApproved={isApproved}
          label={PRD_MESSAGES.SECTION_USER_STORIES}
          number={6}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          prdContent={content}
          projectId={projectId}
          renderEditor={(draft, setDraft) => (
            <UserStoryListEditor onChange={setDraft} value={draft} />
          )}
          renderView={() => renderStories(content.user_stories)}
          sectionKey="user_stories"
          stitch={(value) => ({ ...content, user_stories: value })}
          value={content.user_stories}
        />
        <PrdSectionEditor
          isApproved={isApproved}
          label={PRD_MESSAGES.SECTION_OUT_OF_SCOPE}
          number={7}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          prdContent={content}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <StringListEditor onChange={setDraft} value={draft} />}
          renderView={() => renderList(content.out_of_scope)}
          sectionKey="out_of_scope"
          stitch={(value) => ({ ...content, out_of_scope: value })}
          value={content.out_of_scope}
        />
        <PrdSectionEditor
          isApproved={isApproved}
          label={PRD_MESSAGES.SECTION_OPEN_QUESTIONS}
          number={8}
          onDirtyChange={handleDirtyChange}
          onSaved={handleSaved}
          prdContent={content}
          projectId={projectId}
          renderEditor={(draft, setDraft) => <StringListEditor onChange={setDraft} value={draft} />}
          renderView={() => renderList(content.open_questions)}
          sectionKey="open_questions"
          stitch={(value) => ({ ...content, open_questions: value })}
          value={content.open_questions}
        />
      </div>

      {/*
        Footer ribbon. After moving Approve / Regenerate-all / Download into the header toolbar
        above, PrdActions is reduced to the "approved → next step" guidance banner, which is still
        useful as an end-of-document call to action pointing at architecture.
      */}
      <PrdActions isFinal={prd.is_final} projectId={projectId} />
    </article>
  );
}
