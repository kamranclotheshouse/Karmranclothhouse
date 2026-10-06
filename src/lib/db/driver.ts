/**
 * Database driver.
 *
 * Two interchangeable backends behind one `query()` signature:
 *
 *   • `NEON_DATABASE_URL` set  → Neon over HTTP (the production path).
 *   • unset, development      → PGlite, an in-process Postgres kept on disk
 *                                under `.data/dev-db`. Lets the admin panel be
 *                                built and exercised with no account at all.
 *   • unset, production       → throws. A store silently running against an
 *                                empty local database would be worse than a
 *                                crash, so it fails loudly instead.
 *
 * Never import this from client code: `NEON_DATABASE_URL` is a read/write
 * credential and must stay server-side.
 */

export type QueryResult = { rows: Record<string, unknown>[] };
export type QueryFn = (sql: string, params?: unknown[]) => Promise<QueryResult>;

const g = globalThis as unknown as {
  __kchQuery?: QueryFn;
  /** In-flight initialisation — concurrent requests must not open two databases. */
  __kchQueryPending?: Promise<QueryFn>;
  __kchDriverName?: string;
};

/** Which backend is in use — surfaced in the dev console banner. */
export function driverName(): 'neon' | 'pglite' | 'unavailable' {
  if (process.env.NEON_DATABASE_URL) return 'neon';
  if (process.env.NODE_ENV !== 'production') return 'pglite';
  return 'unavailable';
}

/**
 * Errors that mean "the connection never got established", so no statement can
 * have been applied. Safe to retry even for INSERT/UPDATE/DELETE.
 *
 * Deliberately excludes body/headers timeouts: those can happen *after* a
 * statement committed, and replaying them would duplicate a row.
 */
const CONNECT_ERROR = new RegExp(
  [
    'ConnectTimeout',
    'UND_ERR_CONNECT_TIMEOUT',
    'ECONNREFUSED',
    'ECONNRESET',
    'ENOTFOUND',
    'EAI_AGAIN',
    'ETIMEDOUT',
    'socket hang up',
    'other side closed',
  ].join('|'),
  'i'
);

function isConnectFailure(error: unknown): boolean {
  const seen = new Set<unknown>();
  let cursor: unknown = error;

  // NeonDbError wraps the real cause in `sourceError`; undici wraps again in
  // `cause`. Walk the chain rather than pattern-matching one level deep.
  for (let depth = 0; depth < 6 && cursor && !seen.has(cursor); depth++) {
    seen.add(cursor);
    const candidate = cursor as { code?: string; message?: string };
    if (CONNECT_ERROR.test(`${candidate.code ?? ''} ${candidate.message ?? ''}`)) return true;
    cursor = (cursor as { sourceError?: unknown; cause?: unknown }).sourceError ??
      (cursor as { cause?: unknown }).cause;
  }
  return false;
}

async function createNeonDriver(url: string): Promise<QueryFn> {
  const { neon } = await import('@neondatabase/serverless');

  const sql = neon(url);

  const RETRIES = 2;
  const DELAYS = [250, 750];

  return async (statement, params = []) => {
    for (let attempt = 0; ; attempt++) {
      try {
        const rows = await sql.query(statement, params);
        return { rows: rows as Record<string, unknown>[] };
      } catch (error) {
        if (attempt >= RETRIES || !isConnectFailure(error)) throw error;
        await new Promise((r) => setTimeout(r, DELAYS[attempt] ?? 1500));
      }
    }
  };
}

async function createPgliteDriver(): Promise<QueryFn> {
  const { PGlite } = await import('@electric-sql/pglite');
  const { existsSync, readFileSync } = await import('node:fs');
  const { mkdir } = await import('node:fs/promises');
  const { join } = await import('node:path');

  // Reused across dev-server hot reloads — without this every file save would
  // spin up a fresh database and drop whatever the admin had just entered.
  const key = '__kchPglite' as const;
  const store = globalThis as unknown as Record<string, InstanceType<typeof PGlite> | undefined>;

  let db = store[key];
  if (!db) {
    // Statically rooted at `.data/` on purpose: a fully dynamic path here makes
    // the bundler trace the whole project (including `public/`) into the server
    // output. `KCH_DB_DIR` is a folder *name* inside `.data`, not a path.
    const dataDir = join(process.cwd(), '.data', process.env.KCH_DB_DIR || 'dev-db');

    // Recorded before PGlite creates it, so a brand-new dev database can be
    // populated once. An existing one is left exactly as the admin left it.
    const isFresh = !existsSync(dataDir);

    // PGlite's node filesystem layer does a non-recursive mkdir, so the parent
    // must already exist.
    await mkdir(join(dataDir, '..'), { recursive: true });

    const instance = new PGlite({ dataDir });
    store[key] = instance;

    // Bring an existing dev database up to date with the current schema.
    const ddl = readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8');
    await instance.exec(ddl);

    if (isFresh) {
      const { seed } = await import('./seed');
      await seed(async (sql, params = []) => {
        const result = await instance.query(sql, params);
        return { rows: result.rows as Record<string, unknown>[] };
      });
      console.log('[db] New development database created and seeded.');
    }

    db = instance;
  }

  return async (statement, params = []) => {
    const result = await db!.query(statement, params);
    return { rows: result.rows as Record<string, unknown>[] };
  };
}

/** Runs `create` once; a failed attempt is forgotten so the next call retries. */
function settle(name: 'neon' | 'pglite', create: () => Promise<QueryFn>): Promise<QueryFn> {
  const pending = create()
    .then((run) => {
      g.__kchQuery = run;
      g.__kchDriverName = name;
      return run;
    })
    .catch((error) => {
      g.__kchQueryPending = undefined;
      throw error;
    });
  g.__kchQueryPending = pending;
  return pending;
}

export async function getQuery(): Promise<QueryFn> {
  if (g.__kchQuery) return g.__kchQuery;
  if (g.__kchQueryPending) return g.__kchQueryPending;

  const url = process.env.NEON_DATABASE_URL;
  if (url) return settle('neon', () => createNeonDriver(url));

  if (process.env.NODE_ENV !== 'production') return settle('pglite', createPgliteDriver);

  throw new Error(
    'NEON_DATABASE_URL is not set. Add it to .env.local (and to the Vercel project ' +
      'settings) so the store can reach its database.'
  );
}

/** Convenience: run one statement and return its rows. */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const run = await getQuery();
  const result = await run(sql, params);
  return result.rows as T[];
}
