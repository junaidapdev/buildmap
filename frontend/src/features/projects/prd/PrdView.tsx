import { Badge } from '@/components/ui/badge';
import { PRD_MESSAGES } from '@/features/projects/prd/messages';
import { PrdActions } from '@/features/projects/prd/PrdActions';
import { PrdFeatureCard } from '@/features/projects/prd/PrdFeatureCard';
import { PrdSection } from '@/features/projects/prd/PrdSection';
import { PrdUserStoryCard } from '@/features/projects/prd/PrdUserStoryCard';
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

export function PrdView({ prd, projectId }: PrdViewProps) {
  const generate = useGeneratePrd(projectId);
  const approve = useApprovePrd(projectId);
  const content = prd.content_json;

  return (
    <article className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline">{PRD_MESSAGES.VERSION_LABEL(prd.version)}</Badge>
        <span className="text-xs text-muted-foreground">
          {PRD_MESSAGES.LAST_UPDATED_PREFIX}{' '}
          {formatRelativeTime(prd.updated_at, PRD_MESSAGES.UPDATED_JUST_NOW)}
        </span>
      </div>

      <div className="space-y-8">
        <PrdSection title={PRD_MESSAGES.SECTION_GOAL}>
          <p>{content.goal}</p>
        </PrdSection>
        <PrdSection title={PRD_MESSAGES.SECTION_TARGET_USERS}>
          {renderList(content.target_users)}
        </PrdSection>
        <PrdSection title={PRD_MESSAGES.SECTION_PROBLEM}>
          <p>{content.problem_statement}</p>
        </PrdSection>
        <PrdSection title={PRD_MESSAGES.SECTION_SUCCESS_CRITERIA}>
          {renderList(content.success_criteria)}
        </PrdSection>
        <PrdSection title={PRD_MESSAGES.SECTION_FEATURES}>
          {content.features.length === 0 ? (
            <p className="text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {content.features.map((feature) => (
                <PrdFeatureCard feature={feature} key={feature.id} />
              ))}
            </div>
          )}
        </PrdSection>
        <PrdSection title={PRD_MESSAGES.SECTION_USER_STORIES}>
          {content.user_stories.length === 0 ? (
            <p className="text-muted-foreground">{PRD_MESSAGES.EMPTY_LIST}</p>
          ) : (
            <div className="space-y-3">
              {content.user_stories.map((story) => (
                <PrdUserStoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </PrdSection>
        <PrdSection title={PRD_MESSAGES.SECTION_OUT_OF_SCOPE}>
          {renderList(content.out_of_scope)}
        </PrdSection>
        <PrdSection title={PRD_MESSAGES.SECTION_OPEN_QUESTIONS}>
          {renderList(content.open_questions)}
        </PrdSection>
      </div>

      <PrdActions
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
