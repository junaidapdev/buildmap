import { z } from 'zod';

export const ExportProjectZipInputSchema = z.object({
  projectId: z.string().uuid(),
});

export type ExportProjectZipInput = z.infer<typeof ExportProjectZipInputSchema>;
