import { useEffect, useRef, useState } from 'react';

import { logger } from '@/lib/logger';

export type CopyState = 'idle' | 'busy' | 'done' | 'error';

const REVERT_DELAY_MS = 2000;

/**
 * Wraps navigator.clipboard.writeText with a transient state so the UI can show "Copied!" / "Copy
 * failed" briefly before reverting. The revert timer is cleared on unmount so a late callback does
 * not setState on a stale instance. Failures log a non-sensitive code and resolve to 'error' rather
 * than throwing — the caller surfaces the state through the messages catalog.
 *
 * Lifted out of features/projects/feature-specs/prompt/ in Chunk 23 so the issue-to-spec converter
 * can reuse the same transient-state copy flow without duplicating the hook or cross-importing
 * across feature folders.
 */
export function useCopyToClipboard() {
  const [state, setState] = useState<CopyState>('idle');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  function scheduleRevert(): void {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      setState('idle');
      timerRef.current = null;
    }, REVERT_DELAY_MS);
  }

  async function copy(text: string): Promise<void> {
    setState('busy');
    try {
      await navigator.clipboard.writeText(text);
      setState('done');
      scheduleRevert();
    } catch (error) {
      logger.error('clipboard_copy_failed', {
        name: error instanceof Error ? error.name : 'unknown',
      });
      setState('error');
      scheduleRevert();
    }
  }

  return { state, copy };
}
