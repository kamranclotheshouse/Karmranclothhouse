import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, verifySessionToken } from '@/lib/session';

export async function GET() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return NextResponse.json({ authenticated: verifySessionToken(token) });
}
