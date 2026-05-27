import { z } from 'zod';

import { env } from '@/config/env';

const EdgeEnvelopeSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), data: z.unknown() }),
  z.object({
    ok: z.literal(false),
    error: z.object({ code: z.string(), message: z.string() }),
  }),
]);

const EDGE_RESPONSE_INVALID = 'EDGE_RESPONSE_INVALID';

export async function callEdgeFunction(
  name: string,
  body: unknown,
  accessToken: string,
): Promise<unknown> {
  const response = await fetch(`${env.VITE_SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      apikey: env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  const envelope = EdgeEnvelopeSchema.safeParse(await response.json().catch(() => null));

  if (!envelope.success) {
    throw new Error(EDGE_RESPONSE_INVALID);
  }

  if (!response.ok || !envelope.data.ok) {
    throw new Error(envelope.data.ok ? EDGE_RESPONSE_INVALID : envelope.data.error.code);
  }

  return envelope.data.data;
}
