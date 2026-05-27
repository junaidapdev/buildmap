type RelativeTimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

const MINUTE_IN_MS = 60 * 1000;

const RELATIVE_TIME_UNITS: readonly { unit: RelativeTimeUnit; milliseconds: number }[] = [
  { unit: 'year', milliseconds: 365 * 24 * 60 * MINUTE_IN_MS },
  { unit: 'month', milliseconds: 30 * 24 * 60 * MINUTE_IN_MS },
  { unit: 'week', milliseconds: 7 * 24 * 60 * MINUTE_IN_MS },
  { unit: 'day', milliseconds: 24 * 60 * MINUTE_IN_MS },
  { unit: 'hour', milliseconds: 60 * MINUTE_IN_MS },
  { unit: 'minute', milliseconds: MINUTE_IN_MS },
] as const;

const relativeTimeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'always' });

export function formatRelativeTime(iso: string, justNowLabel: string): string {
  const timestamp = new Date(iso).getTime();

  if (!Number.isFinite(timestamp)) {
    return justNowLabel;
  }

  const differenceInMs = timestamp - Date.now();

  if (Math.abs(differenceInMs) < MINUTE_IN_MS) {
    return justNowLabel;
  }

  for (const { unit, milliseconds } of RELATIVE_TIME_UNITS) {
    if (Math.abs(differenceInMs) >= milliseconds) {
      return relativeTimeFormatter.format(Math.round(differenceInMs / milliseconds), unit);
    }
  }

  return justNowLabel;
}
