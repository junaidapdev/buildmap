import { useCallback, useState } from 'react';

import type { PrdContent, PrdSectionKey } from '@shared/schemas/prd';
import { Badge } from '@/components/ui/badge';
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
import { formatRelativeTime } from '@/lib/relative-time';

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
  const content = prd.content_json;
  // Mirror the global is_final into every section's tint. The mockup shows per-section approval,
  // but the backend approves the PRD as a whole; honest visual is all-or-nothing.
  const isApproved = prd.is_final;

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
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{PRD_MESSAGES.VERSION_LABEL(prd.version)}</Badge>
        <span className="text-xs text-muted-foreground">
          {PRD_MESSAGES.LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(prd.updated_at, PRD_MESSAGES.UPDATED_JUST_NOW)}
        </span>
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

      <PrdActions
        content={prd.content}
        isApproving={approve.isPending}
        isFinal={prd.is_final}
        isRegenerating={generate.isPending}
        onApprove={() => approve.mutate()}
        onRegenerate={() => generate.mutate()}
        projectId={projectId}
      />
    </article>
  );
}
