import { useWatch, type Control } from 'react-hook-form';

import type { ClarifyingQuestion as ClarifyingQuestionType } from '@shared/schemas/clarification';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { CLARIFY_CATEGORY_LABELS, CLARIFY_MESSAGES } from '@/features/projects/clarify/messages';

type ClarifyAnswers = Record<string, string>;

type ClarifyQuestionProps = {
  control: Control<ClarifyAnswers>;
  index: number;
  question: ClarifyingQuestionType;
};

export function ClarifyQuestion({ control, index, question }: ClarifyQuestionProps) {
  const value = useWatch({ control, name: question.id }) ?? '';
  const showCharacterCount = value.length >= 800;

  return (
    <Card>
      <CardContent className="p-5">
        <FormField
          control={control}
          name={question.id}
          render={({ field }) => (
            <FormItem>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <FormLabel className="text-base leading-snug">
                  <span className="mr-2 text-muted-foreground">
                    {CLARIFY_MESSAGES.QUESTION_LABEL(index + 1)}
                  </span>
                  {question.text}
                </FormLabel>
                {question.category && (
                  <Badge aria-hidden="true" variant="outline">
                    {CLARIFY_CATEGORY_LABELS[question.category]}
                  </Badge>
                )}
              </div>
              <FormControl>
                <Textarea
                  placeholder={question.example ?? CLARIFY_MESSAGES.ANSWER_PLACEHOLDER}
                  rows={3}
                  {...field}
                />
              </FormControl>
              {showCharacterCount && (
                <p className="text-right text-xs text-muted-foreground">
                  {CLARIFY_MESSAGES.CHARACTER_COUNT(value.length)}
                </p>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
