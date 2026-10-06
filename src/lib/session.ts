import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Signed admin session tokens.
 *
 * The token is `<expiryMs>.<hmac>` where the HMAC covers the expiry and is keyed
 * by ADMIN_SESSION_SECRET. Nothing secret is stored client-side — the cookie only
 * carries the expiry, so a forged value fails verification.
 */

const COOKIE_NAME = 'kch_admin_session';
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) return secret;
  // Keep local development convenient, but never allow a predictable signing
  // secret to authenticate an admin in production.
  return process.env.NODE_ENV === 'production'
    ? null
    : 'kch-dev-only-session-secret-change-me';
}

function sign(expiry: number): string {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured.');
  return createHmac('sha256', secret).update(String(expiry)).digest('hex');
}

export function isSessionSecretConfigured(): boolean {
  return getSecret() !== null;
}

export function createSessionToken(ttlMs: number = DEFAULT_TTL_MS): string {
  const expiry = Date.now() + ttlMs;
  return `${expiry}.${sign(expiry)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expiryRaw, mac] = token.split('.');
  if (!expiryRaw || !mac) return false;

  const expiry = Number(expiryRaw);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const secret = getSecret();
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(String(expiry)).digest('hex');
  const a = Buffer.from(mac, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function checkPin(pin: string): boolean {
  const expected = process.env.ADMIN_PIN;
  if (!expected) return false;
  if (pin.length !== expected.length) return false;
  const a = Buffer.from(pin, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return timingSafeEqual(a, b);
}

export { COOKIE_NAME, DEFAULT_TTL_MS };
