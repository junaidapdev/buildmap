import { useCallback } from 'react';

import { downloadMarkdown } from '@/lib/download';

type DownloadMarkdownInput = {
  filename: string;
  content: string;
};

export function useDownloadMarkdown() {
  return useCallback(({ filename, content }: DownloadMarkdownInput): void => {
    if (content.trim().length === 0) {
      return;
    }

    downloadMarkdown(filename, content);
  }, []);
}
