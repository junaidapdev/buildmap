import { ROUTES } from '@/constants/routes';
import { OVERVIEW_MESSAGES } from '@/features/projects/overview/messages';
import type { Project } from '@/types/project';

/**
 * Inputs the rule engine needs. Each flag describes whether a particular artifact exists or is
 * approved. Future inputs (PRD, architecture, etc.) are typed here so the engine compiles even
 * while those features are stubs.
 */
export type NextActionInputs = {
  project: Project;
  briefExists: boolean;
  briefApproved: boolean;
  prdExists: boolean;
  prdApproved: boolean;
  architectureExists: boolean;
  architectureApproved: boolean;
  contextFilesExist: boolean;
  contextFilesApproved: boolean;
  chunksExist: boolean;
  hasInProgressChunk: boolean;
  hasIncompleteChunk: boolean;
  allChunksDone: boolean;
};

export type NextActionId =
  | 'brief_generate'
  | 'brief_approve'
  | 'prd_generate'
  | 'prd_approve'
  | 'architecture_generate'
  | 'architecture_approve'
  | 'context_files_generate'
  | 'context_files_approve'
  | 'chunks_generate'
  | 'first_chunk'
  | 'continue'
  | 'done';

export type NextAction = {
  /** Display label for the recommendation. */
  label: string;
  /** Path the CTA navigates to. Null when there is no actionable target (e.g. the final state). */
  to: string | null;
  /** A short id used for testing and analytics. */
  id: NextActionId;
};

/**
 * Deterministic recommendation: walk the fixed milestone sequence and return the first unmet step.
 * Pure — no React, no async, no side effects. Add a milestone by inserting a clause in order.
 */
export function recommendNextAction(input: NextActionInputs): NextAction {
  const projectId = input.project.id;

  if (!input.briefExists) {
    return {
      id: 'brief_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_BRIEF_GENERATE,
      to: ROUTES.PROJECT_BRIEF(projectId),
    };
  }
  if (!input.briefApproved) {
    return {
      id: 'brief_approve',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_BRIEF_APPROVE,
      to: ROUTES.PROJECT_BRIEF(projectId),
    };
  }
  if (!input.prdExists) {
    return {
      id: 'prd_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_PRD,
      to: ROUTES.PROJECT_PRD(projectId),
    };
  }
  if (!input.prdApproved) {
    return {
      id: 'prd_approve',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_PRD_APPROVE,
      to: ROUTES.PROJECT_PRD(projectId),
    };
  }
  if (!input.architectureExists) {
    return {
      id: 'architecture_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_ARCHITECTURE,
      to: ROUTES.PROJECT_ARCHITECTURE(projectId),
    };
  }
  if (!input.architectureApproved) {
    return {
      id: 'architecture_approve',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_ARCHITECTURE_APPROVE,
      to: ROUTES.PROJECT_ARCHITECTURE(projectId),
    };
  }
  if (!input.contextFilesExist) {
    return {
      id: 'context_files_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_CONTEXT_FILES,
      to: ROUTES.PROJECT_CONTEXT(projectId),
    };
  }
  if (!input.contextFilesApproved) {
    return {
      id: 'context_files_approve',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_CONTEXT_FILES_APPROVE,
      to: ROUTES.PROJECT_CONTEXT(projectId),
    };
  }
  if (!input.chunksExist) {
    return {
      id: 'chunks_generate',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_CHUNKS,
      to: ROUTES.PROJECT_CHUNKS(projectId),
    };
  }
  if (!input.hasInProgressChunk && input.hasIncompleteChunk) {
    return {
      id: 'first_chunk',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_FIRST_CHUNK,
      to: ROUTES.PROJECT_CHUNKS(projectId),
    };
  }
  if (input.hasInProgressChunk || input.hasIncompleteChunk) {
    return {
      id: 'continue',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_CONTINUE,
      to: ROUTES.PROJECT_CHUNKS(projectId),
    };
  }

  if (input.allChunksDone) {
    return {
      id: 'done',
      label: OVERVIEW_MESSAGES.NEXT_ACTION_DONE,
      to: null,
    };
  }

  // Defensive default for an unexpected flag combination (chunks exist but none are in progress,
  // incomplete, or all done): keep the user moving rather than incorrectly declaring completion.
  return {
    id: 'continue',
    label: OVERVIEW_MESSAGES.NEXT_ACTION_CONTINUE,
    to: ROUTES.PROJECT_CHUNKS(projectId),
  };
}
