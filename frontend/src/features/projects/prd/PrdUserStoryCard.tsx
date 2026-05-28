import { CheckCircle2 } from 'lucide-react';

import type { PrdContent } from '@shared/schemas/prd';
import { Card, CardContent } from '@/components/ui/card';
import { PRD_MESSAGES } from '@/features/projects/prd/messages';

type PrdUserStory = PrdContent['user_stories'][number];

export function PrdUserStoryCard({ story }: { story: PrdUserStory }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <h3 className="font-medium leading-snug">{story.story}</h3>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {PRD_MESSAGES.ACCEPTANCE_CRITERIA}
          </p>
          <ul className="mt-2 space-y-1">
            {story.acceptance_criteria.map((criterion, index) => (
              <li className="flex items-start gap-2 text-sm" key={index}>
                <CheckCircle2
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-green-600 dark:text-green-500"
                />
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
