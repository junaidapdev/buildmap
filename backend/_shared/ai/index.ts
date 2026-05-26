import { z } from 'zod';

import { callProvider as callAnthropic } from '@shared/ai/anthropic.ts';
import { GENERATION_CONFIG } from '@shared/ai/config.ts';
import { callProvider as callOpenAI } from '@shared/ai/openai.ts';
import {
  AiInvalidOutputError,
  type GenerationResult,
  type GenerationType,
  type ProviderCallResult,
} from '@shared/ai/types.ts';

function serializeInput(input: unknown): string {
  if (typeof input === 'string') {
    return input;
  }

  return JSON.stringify(input) ?? String(input);
}

export async function generate<T>(
  type: GenerationType,
  userInput: unknown,
  outputSchema: z.ZodType<T>,
): Promise<GenerationResult<T>> {
  const config = GENERATION_CONFIG[type];
  const start = performance.now();
  let providerResult: ProviderCallResult;

  if (config.provider === 'openai') {
    providerResult = await callOpenAI(config, serializeInput(userInput));
  } else {
    providerResult = await callAnthropic(config, serializeInput(userInput));
  }

  let rawOutput: unknown;

  try {
    rawOutput = JSON.parse(providerResult.content);
  } catch {
    throw new AiInvalidOutputError();
  }

  const validatedOutput = outputSchema.safeParse(rawOutput);

  if (!validatedOutput.success) {
    throw new AiInvalidOutputError();
  }

  return {
    data: validatedOutput.data,
    meta: {
      provider: config.provider,
      model: config.model,
      inputTokens: providerResult.inputTokens,
      outputTokens: providerResult.outputTokens,
      latencyMs: performance.now() - start,
    },
  };
}
