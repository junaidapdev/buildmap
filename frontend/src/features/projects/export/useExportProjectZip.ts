import { useMutation } from '@tanstack/react-query';

import { EDGE_FUNCTIONS } from '@/constants/edge-functions';
import { useAuth } from '@/features/auth/useAuth';
import { slugForFilenameSafe } from '@shared/export/filenames';
import { env } from '@/config/env';
import { logger } from '@/lib/logger';
import { downloadBlob } from '@/lib/download';

type Input = { projectId: string; projectName: string };

export function useExportProjectZip() {
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (input: Input) => {
      if (!session) {
        throw new Error('NOT_AUTHENTICATED');
      }

      const response = await fetch(
        `${env.VITE_SUPABASE_URL}/functions/v1/${EDGE_FUNCTIONS.EXPORT_PROJECT_ZIP}`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${session.access_token}`,
            apikey: env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ projectId: input.projectId }),
        },
      );

      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        const code =
          errBody &&
          typeof errBody === 'object' &&
          'error' in errBody &&
          errBody.error &&
          typeof errBody.error === 'object' &&
          'code' in errBody.error &&
          typeof errBody.error.code === 'string'
            ? errBody.error.code
            : 'EXPORT_FAILED';
        logger.error('export_failed', { status: response.status, code });
        throw new Error(code);
      }

      const blob = await response.blob();
      const cd = response.headers.get('content-disposition') ?? '';
      const filenameMatch = cd.match(/filename="([^"]+)"/);
      const filename =
        filenameMatch?.[1] ??
        `${slugForFilenameSafe(input.projectName)}-specforge-export.zip`;

      downloadBlob(blob, filename);
    },
  });
}
