import { z } from 'zod';

const RawEnvSchema = z.object({
  SUPABASE_URL: z.string().url('must be a valid URL'),
  SUPABASE_ANON_KEY: z.string().min(1, 'is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'is required'),
  OPENAI_API_KEY: z.string().min(1, 'is required'),
  // Optional: every generation type uses OpenAI for now, so the Anthropic key is not required to
  // boot. The Anthropic adapter is retained but dormant. See decisions.md.
  ANTHROPIC_API_KEY: z.string().optional(),
  ENVIRONMENT: z.enum(['development', 'staging', 'production']).default('development'),
  AI_TEST_ENABLED: z.enum(['true', 'false']).default('false'),
  ALLOWED_ORIGINS: z.string().optional(),
}).superRefine((values, ctx) => {
  if (
    values.ENVIRONMENT === 'production' &&
    (!values.ALLOWED_ORIGINS || values.ALLOWED_ORIGINS.split(',').includes('*'))
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['ALLOWED_ORIGINS'],
      message: 'must contain explicit origins in production',
    });
  }
});

const rawEnv = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL'),
  SUPABASE_ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY'),
  SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  OPENAI_API_KEY: Deno.env.get('OPENAI_API_KEY'),
  ANTHROPIC_API_KEY: Deno.env.get('ANTHROPIC_API_KEY'),
  ENVIRONMENT: Deno.env.get('ENVIRONMENT'),
  AI_TEST_ENABLED: Deno.env.get('AI_TEST_ENABLED'),
  ALLOWED_ORIGINS: Deno.env.get('ALLOWED_ORIGINS'),
};

const parsedEnv = RawEnvSchema.safeParse(rawEnv);

if (!parsedEnv.success) {
  const invalidKeys = parsedEnv.error.issues
    .map((issue) => issue.path.join('.') || 'environment')
    .join(', ');

  throw new Error(
    `Invalid backend environment configuration: ${invalidKeys}. Set required Edge Function secrets and allowed origins.`,
  );
}

const allowedOrigins = parsedEnv.data.ALLOWED_ORIGINS ??
  (parsedEnv.data.ENVIRONMENT === 'development' ? '*' : '');

export const env = Object.freeze({
  ...parsedEnv.data,
  AI_TEST_ENABLED: parsedEnv.data.AI_TEST_ENABLED === 'true',
  ALLOWED_ORIGINS: allowedOrigins,
});
