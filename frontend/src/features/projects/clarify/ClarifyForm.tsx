import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import type { ClarifyingQuestion as ClarifyingQuestionType } from '@shared/schemas/clarification';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ROUTES } from '@/constants/routes';
import { ClarifyQuestion } from '@/features/projects/clarify/ClarifyQuestion';
import { CLARIFY_MESSAGES } from '@/features/projects/clarify/messages';

const ClarifyAnswersSchema = z.record(
  z.string(),
  z.string().trim().max(1000, CLARIFY_MESSAGES.ANSWER_TOO_LONG),
);

type ClarifyAnswers = z.infer<typeof ClarifyAnswersSchema>;

type ClarifyFormProps = {
  projectId: string;
  questions: ClarifyingQuestionType[];
};

export function ClarifyForm({ projectId, questions }: ClarifyFormProps) {
  const navigate = useNavigate();
  const form = useForm<ClarifyAnswers>({
    resolver: zodResolver(ClarifyAnswersSchema),
    defaultValues: Object.fromEntries(questions.map((question) => [question.id, ''])),
  });

  function onSubmit(values: ClarifyAnswers): void {
    const clarificationAnswers = questions.flatMap((question) => {
      const answer = values[question.id] ?? '';

      return answer.length > 0 ? [{ id: question.id, text: question.text, answer }] : [];
    });

    navigate(ROUTES.PROJECT_BRIEF(projectId), {
      state: { clarificationAnswers },
    });
  }

  return (
    <Form {...form}>
      <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        {questions.map((question, index) => (
          <ClarifyQuestion
            control={form.control}
            index={index}
            key={question.id}
            question={question}
          />
        ))}
        <div className="flex flex-col gap-3 pt-4 sm:items-end">
          <Button
            aria-busy={form.formState.isSubmitting}
            className="w-full sm:w-auto"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            {form.formState.isSubmitting
              ? CLARIFY_MESSAGES.SUBMIT_BUTTON_BUSY
              : CLARIFY_MESSAGES.SUBMIT_BUTTON}
          </Button>
          <Button asChild className="w-full sm:w-auto" variant="link">
            <Link state={{ clarificationAnswers: [] }} to={ROUTES.PROJECT_BRIEF(projectId)}>
              {CLARIFY_MESSAGES.SKIP_LINK}
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
