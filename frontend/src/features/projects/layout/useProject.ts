import { useContext } from 'react';

import { ProjectContext } from '@/features/projects/layout/ProjectContext';

export function useProject() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error('useProject must be used inside <ProjectLayout>.');
  }

  return context;
}
