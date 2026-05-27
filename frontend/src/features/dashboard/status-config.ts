import type { ProjectStatus } from '@/types/project';

export const PROJECT_STATUSES: readonly ProjectStatus[] = [
  'idea',
  'planning',
  'ready_to_build',
  'building',
  'paused',
  'completed',
] as const;

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    dotClass: string;
  }
> = {
  idea: { label: 'Idea', variant: 'outline', dotClass: 'bg-muted-foreground' },
  planning: { label: 'Planning', variant: 'secondary', dotClass: 'bg-blue-600 dark:bg-blue-500' },
  ready_to_build: {
    label: 'Ready to build',
    variant: 'secondary',
    dotClass: 'bg-blue-600 dark:bg-blue-500',
  },
  building: {
    label: 'Building',
    variant: 'default',
    dotClass: 'bg-amber-600 dark:bg-amber-500',
  },
  paused: { label: 'Paused', variant: 'outline', dotClass: 'bg-muted-foreground' },
  completed: {
    label: 'Completed',
    variant: 'secondary',
    dotClass: 'bg-green-600 dark:bg-green-500',
  },
};
