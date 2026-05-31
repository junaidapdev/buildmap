import { useEffect, useRef, useState } from 'react';

import type { LearningType } from '@shared/schemas/learning';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useProject } from '@/features/projects/layout/useProject';
import { useDocumentTitle } from '@/lib/document-title';
import { AddNotesDialog } from '@/features/projects/knowledge/AddNotesDialog';
import { KnowledgeEmpty } from '@/features/projects/knowledge/KnowledgeEmpty';
import { KnowledgeError } from '@/features/projects/knowledge/KnowledgeError';
import { KnowledgePending } from '@/features/projects/knowledge/KnowledgePending';
import { LearningsByTypeSection } from '@/features/projects/knowledge/LearningsByTypeSection';
import { KNOWLEDGE_MESSAGES } from '@/features/projects/knowledge/messages';
import { useLearnings } from '@/features/projects/knowledge/useLearnings';

const TYPE_ORDER: readonly LearningType[] = [
  'lesson',
  'decision',
  'gotcha',
  'open_question',
] as const;

const RESULT_BANNER_DURATION_MS = 6000;

type ExtractionResult = { count: number; nonce: number } | null;

export function KnowledgePage() {
  // ProjectLayout guarantees a loaded project before this page renders.
  const { project } = useProject();
  const projectId = project.id;
  useDocumentTitle(`Knowledge — ${project.name || 'Project'} — buildmap`);
  const learningsQuery = useLearnings(projectId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastResult, setLastResult] = useState<ExtractionResult>(null);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-dismiss the result banner after 6s — same pattern as Chunk 22's status advance alert.
  useEffect(() => {
    if (!lastResult) {
      return;
    }
    if (dismissTimerRef.current !== null) {
      clearTimeout(dismissTimerRef.current);
    }
    dismissTimerRef.current = setTimeout(() => {
      setLastResult(null);
      dismissTimerRef.current = null;
    }, RESULT_BANNER_DURATION_MS);
    return () => {
      if (dismissTimerRef.current !== null) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [lastResult]);

  function handleExtractionSuccess(count: number): void {
    setLastResult({ count, nonce: (lastResult?.nonce ?? 0) + 1 });
  }

  let body;
  if (learningsQuery.isPending) {
    body = <KnowledgePending />;
  } else if (learningsQuery.isError) {
    body = (
      <KnowledgeError error={learningsQuery.error} onRetry={() => void learningsQuery.refetch()} />
    );
  } else {
    const learnings = learningsQuery.data ?? [];
    if (learnings.length === 0) {
      body = <KnowledgeEmpty onAddNotes={() => setDialogOpen(true)} />;
    } else {
      body = (
        <div className="space-y-8">
          {TYPE_ORDER.map((type) => (
            <LearningsByTypeSection
              key={type}
              learnings={learnings.filter((learning) => learning.type === type)}
              projectId={projectId}
              type={type}
            />
          ))}
        </div>
      );
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold leading-[1.1] tracking-tight">{KNOWLEDGE_MESSAGES.PAGE_TITLE}</h1>
          <p className="mt-2 text-muted-foreground">{KNOWLEDGE_MESSAGES.PAGE_SUBTITLE}</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>{KNOWLEDGE_MESSAGES.ADD_NOTES_BUTTON}</Button>
      </header>

      {lastResult && (
        <Alert>
          <AlertTitle>
            {lastResult.count === 0
              ? KNOWLEDGE_MESSAGES.EXTRACTION_EMPTY
              : KNOWLEDGE_MESSAGES.EXTRACTION_SUCCESS(lastResult.count)}
          </AlertTitle>
          {lastResult.count === 0 && (
            <AlertDescription>{KNOWLEDGE_MESSAGES.EMPTY_BODY}</AlertDescription>
          )}
        </Alert>
      )}

      {body}

      <AddNotesDialog
        onOpenChange={setDialogOpen}
        onSuccess={handleExtractionSuccess}
        open={dialogOpen}
        projectId={projectId}
      />
    </div>
  );
}
