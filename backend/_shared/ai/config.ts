import type { GenerationConfig, GenerationType } from '@shared/ai/types.ts';

export const GENERATION_CONFIG: Record<GenerationType, GenerationConfig> = {
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  idea_clarification: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  project_brief: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  prd_generation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  prd_section_regenerate: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  architecture_generation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  context_files_generation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  chunk_generation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  feature_spec_generation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  agent_prompt_generation: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  issue_to_spec: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
  // TODO(Chunk 09+): Replace this placeholder with the feature-owned prompt.
  knowledge_extraction: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'You are a helpful assistant. Return valid JSON. The real prompt is added in Chunk 09+.',
  },
};
