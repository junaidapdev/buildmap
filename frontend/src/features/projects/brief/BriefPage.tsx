import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { z } from 'zod';

import { ROUTES } from '@/constants/routes';
import { BriefError } from '@/features/projects/brief/BriefError';
import { BRIEF_MESSAGES } from '@/features/projects/brief/messages';
import { BriefPending } from '@/features/projects/brief/BriefPending';
import { BriefView } from '@/features/projects/brief/BriefView';
import { useExistingBrief } from '@/features/projects/brief/useExistingBrief';
import {
  type GenerateBriefAnswer,
  useGenerateBrief,
} from '@/features/projects/brief/useGenerateBrief';

// The clarify step hands answers over as { clarificationAnswers: [{ id, text, answer }] } in route
// state. It is untrusted navigation data, so it is parsed before being mapped to the brief input.
const ClarifyHandoffSchema = z.object({
  clarificationAnswers: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      answer: z.string(),
    }),
  ),
});

function extractAnswers(state: unknown): GenerateBriefAnswer[] | undefined {
  const parsed = ClarifyHandoffSchema.safeParse(state);

  if (!parsed.success) {
    return undefined;
  }

  const mapped: GenerateBriefAnswer[] = parsed.data.clarificationAnswers
    .map((entry) => ({
      questionId: entry.id,
      questionText: entry.text,
      answer: entry.answer.trim(),
    }))
    .filter((entry) => entry.answer.length > 0);

  return mapped.length > 0 ? mapped : undefined;
}

export function BriefPage() {
  const { id } = useParams<{ id: string }>();
  const projectId = id ?? '';
  const location = useLocation();
  const existing = useExistingBrief(projectId);
  const generate = useGenerateBrief(projectId);
  const generateBrief = generate.mutate;
  const autoStarted = useRef(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    // Wait until the existing-brief lookup resolves before deciding whether to generate.
    if (existing.isPending) {
      return;
    }

    // A brief already exists (return visit): display it and never auto-regenerate.
    if (existing.data) {
      return;
    }

    // The ref guards against React StrictMode effect replay issuing a duplicate AI request.
    if (autoStarted.current) {
      return;
    }

    autoStarted.current = true;
    generateBrief({ projectId, answers: extractAnswers(location.state) });
  }, [id, existing.isPending, existing.data, generateBrief, location.state, projectId]);

  if (!id) {
    return <Navigate replace to={ROUTES.DASHBOARD} />;
  }

  function retryGeneration(): void {
    generateBrief({ projectId, answers: extractAnswers(location.state) });
  }

  let body: ReactNode;

  if (existing.isPending) {
    body = <BriefPending />;
  } else if (existing.isError) {
    body = <BriefError onRetry={() => void existing.refetch()} />;
  } else if (existing.data) {
    body = <BriefView brief={existing.data} projectId={projectId} />;
  } else if (generate.isError) {
    body = <BriefError onRetry={retryGeneration} />;
  } else {
    // No brief exists yet and generation is idle or in flight.
    body = <BriefPending />;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">{BRIEF_MESSAGES.PAGE_TITLE}</h1>
        <p className="mt-2 text-muted-foreground">{BRIEF_MESSAGES.PAGE_SUBTITLE}</p>
      </header>
      {body}
    </div>
  );
}
