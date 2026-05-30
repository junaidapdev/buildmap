import { z } from 'zod';

import {
  AiProviderError,
  type GenerationConfig,
  type ProviderCallResult,
} from '@shared/ai/types.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';

const OpenAICompletionSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable(),
      }),
    }),
  ),
  usage: z.object({
    prompt_tokens: z.number(),
    completion_tokens: z.number(),
  }).optional(),
});

export async function callProvider(
  config: GenerationConfig,
  userInput: string,
): Promise<ProviderCallResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: config.systemPrompt },
        { role: 'user', content: userInput },
      ],
      ...(config.temperature === undefined ? {} : { temperature: config.temperature }),
      ...(config.maxOutputTokens === undefined
        ? {}
        : { max_completion_tokens: config.maxOutputTokens }),
      ...(config.responseFormat === undefined
        ? {}
        : { response_format: { type: config.responseFormat } }),
    }),
  });

  if (!response.ok) {
    throw new AiProviderError(
      `OpenAI request failed with HTTP status ${response.status}.`,
      'openai',
      config.model,
      response.status,
    );
  }

  const result = OpenAICompletionSchema.safeParse(await response.json());

  if (!result.success) {
    throw new AiProviderError(
      'OpenAI returned an unexpected response shape.',
      'openai',
      config.model,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    );
  }

  const content = result.data.choices[0]?.message.content;

  if (!content) {
    throw new AiProviderError(
      'OpenAI returned no text content.',
      'openai',
      config.model,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
    );
  }

  return {
    content,
    inputTokens: result.data.usage?.prompt_tokens ?? 0,
    outputTokens: result.data.usage?.completion_tokens ?? 0,
  };
}
