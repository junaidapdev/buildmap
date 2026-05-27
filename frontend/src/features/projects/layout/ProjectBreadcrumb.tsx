import { Link } from 'react-router-dom';

import { ROUTES } from '@/constants/routes';
import { PROJECT_LAYOUT_MESSAGES } from '@/features/projects/layout/messages';
import { useProject } from '@/features/projects/layout/useProject';
import { truncate } from '@/lib/truncate';

const MAX_BREADCRUMB_NAME = 40;

export function ProjectBreadcrumb() {
  const { project } = useProject();

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
      <Link className="hover:text-foreground" to={ROUTES.DASHBOARD}>
        {PROJECT_LAYOUT_MESSAGES.BREADCRUMB_PROJECTS}
      </Link>
      <span aria-hidden="true" className="mx-2">
        /
      </span>
      <span className="text-foreground" title={project.name}>
        {truncate(project.name, MAX_BREADCRUMB_NAME)}
      </span>
    </nav>
  );
}
