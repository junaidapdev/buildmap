import { z } from 'zod';

const EnvSchema = z.object({
  VITE_SUPABASE_URL: z.url('must be a valid URL'),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, 'is required'),
});

const parsedEnv = EnvSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  const invalidKeys = parsedEnv.error.issues
    .map((issue) => issue.path.join('.') || 'environment')
    .join(', ');

  throw new Error(
    `Invalid frontend environment configuration: ${invalidKeys}. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.`,
  );
}

export const env = Object.freeze(parsedEnv.data);

export const IS_PRODUCTION = import.meta.env.PROD;
