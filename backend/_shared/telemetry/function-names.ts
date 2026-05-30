export const GENERATION_FUNCTION_NAMES = {
  GENERATE_CLARIFYING_QUESTIONS: 'generate-clarifying-questions',
  GENERATE_PROJECT_BRIEF: 'generate-project-brief',
  GENERATE_PRD: 'generate-prd',
  REGENERATE_PRD_SECTION: 'regenerate-prd-section',
  GENERATE_ARCHITECTURE: 'generate-architecture',
  REGENERATE_ARCHITECTURE_SECTION: 'regenerate-architecture-section',
  GENERATE_CONTEXT_FILES: 'generate-context-files',
  REGENERATE_CONTEXT_DOC: 'regenerate-context-doc',
  GENERATE_CHUNKS: 'generate-chunks',
  GENERATE_FEATURE_SPEC: 'generate-feature-spec',
  REGENERATE_FEATURE_SPEC_SECTION: 'regenerate-feature-spec-section',
  GENERATE_AGENT_PROMPT: 'generate-agent-prompt',
  GENERATE_ISSUE_PROMPT: 'generate-issue-prompt',
  EXTRACT_LEARNINGS: 'extract-learnings',
} as const;

export type GenerationFunctionName =
  typeof GENERATION_FUNCTION_NAMES[keyof typeof GENERATION_FUNCTION_NAMES];
