import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  BookOpen,
  Compass,
  Download,
  FileText,
  KanbanSquare,
  Layers,
  LayoutDashboard,
  Settings,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

import { ROUTES } from '@/constants/routes';

export type NavItem = {
  /** Stable id for keys and development route reporting. */
  id: string;
  label: string;
  icon: LucideIcon;
  to: string | ((projectId: string) => string);
  /** Present destinations are shown but stay inert until their owning chunk lands. */
  pendingChunk?: number;
};

export const GLOBAL_NAV: readonly NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  {
    id: 'user-settings',
    label: 'Settings',
    icon: Settings,
    to: ROUTES.USER_SETTINGS,
    pendingChunk: 29,
  },
] as const;

export const PROJECT_NAV: readonly NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Compass,
    to: ROUTES.PROJECT_OVERVIEW,
  },
  { id: 'brief', label: 'Brief', icon: FileText, to: ROUTES.PROJECT_BRIEF },
  { id: 'prd', label: 'PRD', icon: FileText, to: ROUTES.PROJECT_PRD },
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Layers,
    to: ROUTES.PROJECT_ARCHITECTURE,
  },
  {
    id: 'context',
    label: 'Context Files',
    icon: BookOpen,
    to: ROUTES.PROJECT_CONTEXT,
  },
  {
    id: 'chunks',
    label: 'Chunks',
    icon: KanbanSquare,
    to: ROUTES.PROJECT_CHUNKS,
  },
  {
    id: 'progress',
    label: 'Progress',
    icon: Activity,
    to: ROUTES.PROJECT_PROGRESS,
  },
  {
    id: 'issues',
    label: 'Issues',
    icon: AlertOctagon,
    to: ROUTES.PROJECT_ISSUES,
  },
  {
    id: 'knowledge',
    label: 'Knowledge',
    icon: BookOpen,
    to: ROUTES.PROJECT_KNOWLEDGE,
  },
  {
    id: 'export',
    label: 'Export',
    icon: Download,
    to: ROUTES.PROJECT_EXPORT,
    pendingChunk: 25,
  },
  {
    id: 'project-settings',
    label: 'Settings',
    icon: SlidersHorizontal,
    to: ROUTES.PROJECT_SETTINGS,
    pendingChunk: 29,
  },
] as const;

export const PROJECT_BACK_NAV: NavItem = {
  id: 'back-to-projects',
  label: 'Back to projects',
  icon: ArrowLeft,
  to: ROUTES.DASHBOARD,
};
