import { NextResponse } from 'next/server';
import {
  checkPin,
  createSessionToken,
  COOKIE_NAME,
  DEFAULT_TTL_MS,
  isSessionSecretConfigured,
} from '@/lib/session';

export async function POST(request: Request) {
  let pin = '';
  try {
    const body = await request.json();
    pin = typeof body?.pin === 'string' ? body.pin : '';
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  if (!process.env.ADMIN_PIN) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_PIN is not configured on the server.' },
      { status: 503 }
    );
  }

  if (!isSessionSecretConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'ADMIN_SESSION_SECRET is not configured on the server.' },
      { status: 503 }
    );
  }

  if (!checkPin(pin)) {
    // Constant-ish work regardless of outcome so response timing leaks nothing.
    checkPin('00000000');
    return NextResponse.json({ ok: false, error: 'Incorrect PIN.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, createSessionToken(DEFAULT_TTL_MS), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: DEFAULT_TTL_MS / 1000,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
