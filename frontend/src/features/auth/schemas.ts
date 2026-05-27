import { z } from 'zod';

export const SignInSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export type SignInInput = z.infer<typeof SignInSchema>;

export const SignUpSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password is too long.'),
  displayName: z.string().trim().min(1, 'Enter a name.').max(80).optional(),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
