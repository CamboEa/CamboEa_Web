// CamboEA - Typed API client helpers

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function postJson<TResponse>(
  path: string,
  body: unknown,
): Promise<TResponse> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const payload = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok) {
    const message = typeof payload.error === 'string'
      ? payload.error
      : `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return payload as TResponse;
}

export type ContactRequest = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactResponse = {
  success: boolean;
  queued?: boolean;
};

export function submitContactForm(payload: ContactRequest): Promise<ContactResponse> {
  return postJson<ContactResponse>('/api/contact', payload);
}
