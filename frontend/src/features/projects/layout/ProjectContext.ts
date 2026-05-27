import { createContext } from 'react';

import type { Project } from '@/types/project';

export type ProjectContextValue = {
  project: Project;
  /** Refetches the project after mutations (e.g. a subpage advancing the project status). */
  refetchProject: () => void;
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);
