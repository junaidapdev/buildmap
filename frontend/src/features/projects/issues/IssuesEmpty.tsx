import { Button } from '@/components/ui/button';
import { ISSUE_MESSAGES } from '@/features/projects/issues/messages';

type IssuesEmptyProps = {
  onCreate: () => void;
};

export function IssuesEmpty({ onCreate }: IssuesEmptyProps) {
  return (
    <div className="space-y-4 rounded-lg border border-dashed p-12 text-center">
      <h3 className="text-lg font-semibold">{ISSUE_MESSAGES.EMPTY_TITLE}</h3>
      <p className="text-muted-foreground">{ISSUE_MESSAGES.EMPTY_BODY}</p>
      <Button onClick={onCreate}>{ISSUE_MESSAGES.EMPTY_NEW_ISSUE}</Button>
    </div>
  );
}
