import { NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/session';

/** Response shape used by every admin endpoint. */
export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, ...data }, init);
}

export function fail(error: string, status = 400): NextResponse {
  return NextResponse.json({ ok: false, error }, { status });
}

/**
 * Every mutating admin endpoint passes through here. The cookie is httpOnly, so
 * the browser attaches it automatically — the client never holds a token.
 */
export function requireAdmin(request: Request): NextResponse | null {
  const token = request.headers.get('cookie')?.match(new RegExp(`${COOKIE_NAME}=([^;]+)`))?.[1];
  if (!verifySessionToken(token)) {
    return fail('You are signed out. Sign in again to continue.', 401);
  }
  return null;
}

/** Reads a JSON body once and reports a friendly error instead of a stack. */
export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
