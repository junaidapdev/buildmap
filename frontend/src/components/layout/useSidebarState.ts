import { useState, type Dispatch, type SetStateAction } from 'react';

import { logger } from '@/lib/logger';

const SIDEBAR_STORAGE_KEY = 'buildmap.sidebar.collapsed';

function initialCollapsedState(): boolean {
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
  } catch {
    logger.warn('sidebar_preference_read_failed');
    return false;
  }
}

export function useSidebarState(): readonly [boolean, Dispatch<SetStateAction<boolean>>] {
  const [collapsed, setCollapsedState] = useState(initialCollapsedState);

  function setCollapsed(next: SetStateAction<boolean>): void {
    setCollapsedState((current) => {
      const value = typeof next === 'function' ? next(current) : next;

      try {
        window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
      } catch {
        logger.warn('sidebar_preference_write_failed');
      }

      return value;
    });
  }

  return [collapsed, setCollapsed] as const;
}
