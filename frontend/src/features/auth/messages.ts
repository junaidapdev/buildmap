import type { AuthError } from '@supabase/supabase-js';

import { ERROR_MESSAGES } from '@/constants/errors';

export const AUTH_MESSAGES = {
  SIGN_IN_TITLE: 'Sign in to buildmap',
  SIGN_IN_SUBTITLE: 'Welcome back. Pick up where you left off.',
  SIGN_UP_TITLE: 'Create your buildmap account',
  SIGN_UP_SUBTITLE: 'Start turning ideas into shippable specs.',
  EMAIL_LABEL: 'Email',
  PASSWORD_LABEL: 'Password',
  DISPLAY_NAME_LABEL: 'Name (optional)',
  SIGN_IN_BUTTON: 'Sign in',
  SIGN_UP_BUTTON: 'Create account',
  HOME_SIGN_UP_BUTTON: 'Sign up',
  GOOGLE_BUTTON: 'Continue with Google',
  OR_DIVIDER: 'or',
  TO_SIGN_UP: "Don't have an account?",
  TO_SIGN_UP_LINK: 'Create one',
  TO_SIGN_IN: 'Already have an account?',
  TO_SIGN_IN_LINK: 'Sign in',
  EMAIL_SENT_TITLE: 'Check your email',
  EMAIL_SENT_BODY: 'We sent you a confirmation link. Click it to finish setting up your account.',
  CONFIRM_PROCESSING: 'Confirming your email...',
  CONFIRM_SUCCESS: 'Email confirmed. You are signed in.',
  CONFIRM_FAILED: 'We could not confirm your email. The link may have expired.',
  OAUTH_PROCESSING: 'Finishing sign-in...',
  OAUTH_FAILED: 'Sign-in did not complete. Try again.',
  SIGN_OUT_BUTTON: 'Sign out',
  TRY_AGAIN_LINK: 'Try again',
  AUTH_LOADING: 'Checking your session...',
  HOME_SIGNED_OUT_TITLE: 'buildmap',
  HOME_SIGNED_OUT_SUBTITLE: 'coming soon',
  HOME_SIGNED_IN_TITLE: 'Welcome back',
  HOME_SIGNED_IN_SUBTITLE: 'Your project workspace is ready.',
  GO_TO_DASHBOARD: 'Go to dashboard',
  DASHBOARD_PLACEHOLDER: 'Dashboard placeholder - Chunk 07 will replace this.',
} as const;

export function authErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'invalid_credentials':
      return ERROR_MESSAGES.INVALID_CREDENTIALS;
    case 'email_not_confirmed':
      return ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
    case 'email_exists':
    case 'user_already_exists':
      return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
    case 'weak_password':
      return ERROR_MESSAGES.WEAK_PASSWORD;
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return ERROR_MESSAGES.RATE_LIMITED;
    case 'validation_failed':
      return ERROR_MESSAGES.VALIDATION;
    default:
      return ERROR_MESSAGES.AUTH_GENERIC;
  }
}
