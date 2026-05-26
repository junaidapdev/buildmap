import { z } from 'zod';

import {
  AiProviderError,
  type GenerationConfig,
  type ProviderCallResult,
} from '@shared/ai/types.ts';
import { HTTP_STATUS } from '@shared/constants/http.ts';
import { env } from '@shared/env.ts';

const AnthropicMessageSchema = z.object({
  content: z.array(
    z.object({
      type: z.literal('text'),
      text: z.string(),
    }),
  ),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
  }),
});

export async function callProvider(
  config: GenerationConfig,
  userInput: string,
): Promise<ProviderCallResult> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: config.maxOutputTokens ?? 4096,
      system: config.systemPrompt,
      messages: [{ role: 'user', content: userInput }],
      ...(config.temperature === undefined ? {} : { temperature: config.temperature }),
    }),
  });

  if (!response.ok) {
    throw new AiProviderError(
      'anthropic',
      response.status,
      `Anthropic request failed with HTTP status ${response.status}.`,
    );
  }

  const result = AnthropicMessageSchema.safeParse(await response.json());

  if (!result.success) {
    throw new AiProviderError(
      'anthropic',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      'Anthropic returned an unexpected response shape.',
    );
  }

  const content = result.data.content.map((block) => block.text).join('\n');

  if (!content) {
    throw new AiProviderError(
      'anthropic',
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      'Anthropic returned no text content.',
    );
  }

  return {
    content,
    inputTokens: result.data.usage.input_tokens,
    outputTokens: result.data.usage.output_tokens,
  };
}
