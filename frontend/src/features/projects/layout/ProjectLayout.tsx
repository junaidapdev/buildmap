import { useMemo } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { z } from 'zod';

import { ProjectBreadcrumb } from '@/features/projects/layout/ProjectBreadcrumb';
import { ProjectContext } from '@/features/projects/layout/ProjectContext';
import { ProjectLayoutError } from '@/features/projects/layout/ProjectLayoutError';
import { ProjectLayoutPending } from '@/features/projects/layout/ProjectLayoutPending';
import { ProjectNotFound } from '@/features/projects/layout/ProjectNotFound';
import { useProjectQuery } from '@/features/projects/layout/useProjectQuery';

const projectIdSchema = z.string().uuid();

export function ProjectLayout() {
  const { id } = useParams<{ id: string }>();

  // Validate the URL param shape before querying; an invalid id is treated as not found.
  const parsedId = useMemo(() => {
    const result = projectIdSchema.safeParse(id);
    return result.success ? result.data : null;
  }, [id]);

  // The query is always called (Rules of Hooks) but disabled for an invalid id so it never runs.
  const query = useProjectQuery(parsedId ?? '', { enabled: parsedId !== null });

  if (!parsedId) {
    return <ProjectNotFound />;
  }

  if (query.isPending) {
    return <ProjectLayoutPending />;
  }

  if (query.isError) {
    return <ProjectLayoutError onRetry={() => void query.refetch()} />;
  }

  // null means the project does not exist or RLS scoped it out; both surface as not found so we
  // never leak which project ids exist for other users.
  if (!query.data) {
    return <ProjectNotFound />;
  }

  return (
    <ProjectContext.Provider
      value={{ project: query.data, refetchProject: () => void query.refetch() }}
    >
      <div className="space-y-6">
        <ProjectBreadcrumb />
        <Outlet />
      </div>
    </ProjectContext.Provider>
  );
}
