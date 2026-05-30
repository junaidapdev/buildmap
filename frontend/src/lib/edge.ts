import { z } from 'zod';

import { env } from '@/config/env';

const EdgeEnvelopeSchema = z.discriminatedUnion('ok', [
  z.object({ ok: z.literal(true), data: z.unknown() }),
  z.object({
    ok: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      metadata: z.record(z.string(), z.unknown()).optional(),
    }),
  }),
]);

const EDGE_RESPONSE_INVALID = 'EDGE_RESPONSE_INVALID';

export class EdgeFunctionError extends Error {
  constructor(
    public readonly code: string,
    public readonly httpStatus: number,
    public readonly metadata: Record<string, unknown> | null,
    message: string,
  ) {
    super(message);
    this.name = 'EdgeFunctionError';
  }
}

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
    throw new EdgeFunctionError(
      EDGE_RESPONSE_INVALID,
      response.status,
      null,
      EDGE_RESPONSE_INVALID,
    );
  }

  if (!response.ok || !envelope.data.ok) {
    if (envelope.data.ok) {
      throw new EdgeFunctionError(
        EDGE_RESPONSE_INVALID,
        response.status,
        null,
        EDGE_RESPONSE_INVALID,
      );
    }

    throw new EdgeFunctionError(
      envelope.data.error.code,
      response.status,
      envelope.data.error.metadata ?? null,
      envelope.data.error.message,
    );
  }

  return envelope.data.data;
}
