import type { LearningType } from '@shared/schemas/learning';
import { LearningCard } from '@/features/projects/knowledge/LearningCard';
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';
import type { LearningRow } from '@/features/projects/knowledge/useLearnings';

type LearningsByTypeSectionProps = {
  projectId: string;
  type: LearningType;
  learnings: LearningRow[];
};

/**
 * One labeled group of learnings (e.g. all "lessons" in one section). The page renders the four
 * groups in a fixed order so the layout is deterministic regardless of ingestion order.
 */
export function LearningsByTypeSection({
  projectId,
  type,
  learnings,
}: LearningsByTypeSectionProps) {
  if (learnings.length === 0) {
    return null;
  }
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{KNOWLEDGE_MESSAGES.TYPE_SECTION_LABELS[type]}</h2>
      <div className="space-y-3">
        {learnings.map((learning) => (
          <LearningCard key={learning.id} learning={learning} projectId={projectId} />
        ))}
      </div>
    </section>
  );
}
