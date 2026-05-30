import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

/**
 * Tailwind config — buildmap design system.
 *
 * Existing shadcn token names are kept verbatim so every primitive (Button, Card, Badge, Tabs,
 * Dialog, …) continues to resolve `bg-background`, `text-muted-foreground`, `border-border` etc.
 * The buildmap extensions add:
 *   - `bg-elevated`, `bg-subtle`, `bg-hover`, `bg-inset` — surface ladder.
 *   - `border-strong`, `border-subtle` — stronger / softer border variants.
 *   - `text-secondary`, `text-faint` — secondary copy + hint tints.
 *   - `brand`, `brand-hover`, `brand-soft`, `brand-text`, `brand-on` — oklch-tuned green accent.
 *   - status families (`status-backlog`, `status-progress`, `status-done`, `status-blocked`,
 *     `status-review`) for chunk-board, badges, banners.
 *   - `shadow-pop` for modals / popovers.
 *   - `font-display` for the Geist display use; `font-mono` for code/eyebrow.
 */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          'Geist',
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'Geist Mono',
          'ui-monospace',
          'SF Mono',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      colors: {
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        'border-subtle': 'hsl(var(--border-subtle))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        elevated: 'hsl(var(--bg-elevated))',
        subtle: 'hsl(var(--bg-subtle))',
        hover: 'hsl(var(--bg-hover))',
        inset: 'hsl(var(--bg-inset))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          hover: 'hsl(var(--brand-hover))',
          soft: 'hsl(var(--brand-soft))',
          'soft-border': 'hsl(var(--brand-soft-border))',
          on: 'hsl(var(--brand-on))',
          text: 'hsl(var(--brand-text))',
        },
        status: {
          'backlog-bg': 'hsl(var(--status-backlog-bg))',
          'backlog-fg': 'hsl(var(--status-backlog-fg))',
          'backlog-border': 'hsl(var(--status-backlog-border))',
          'progress-bg': 'hsl(var(--status-progress-bg))',
          'progress-fg': 'hsl(var(--status-progress-fg))',
          'progress-border': 'hsl(var(--status-progress-border))',
          'done-bg': 'hsl(var(--status-done-bg))',
          'done-fg': 'hsl(var(--status-done-fg))',
          'done-border': 'hsl(var(--status-done-border))',
          'blocked-bg': 'hsl(var(--status-blocked-bg))',
          'blocked-fg': 'hsl(var(--status-blocked-fg))',
          'blocked-border': 'hsl(var(--status-blocked-border))',
          'review-bg': 'hsl(var(--status-review-bg))',
          'review-fg': 'hsl(var(--status-review-fg))',
          'review-border': 'hsl(var(--status-review-border))',
        },
        secondaryText: 'hsl(var(--text-secondary))',
        faint: 'hsl(var(--text-faint))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },
      boxShadow: {
        soft: 'var(--shadow-sm)',
        card: 'var(--shadow-md)',
        elevated: 'var(--shadow-lg)',
        pop: 'var(--shadow-pop)',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
