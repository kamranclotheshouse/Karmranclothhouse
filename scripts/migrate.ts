/**
 * Apply db/schema.sql to the Neon database.
 *
 *   NEON_DATABASE_URL="postgresql://..." npm run db:migrate
 *
 * The DDL is idempotent (IF NOT EXISTS everywhere), so re-running is safe.
 */
import './env';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { neon } from '@neondatabase/serverless';

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  console.error(
    '\n  NEON_DATABASE_URL is not set.\n\n  Create a Neon project, copy its connection string, then run:\n    NEON_DATABASE_URL="postgresql://..." npm run db:migrate\n'
  );
  process.exit(1);
}

const sql = neon(url);
const ddl = readFileSync(resolve(__dirname, '../db/schema.sql'), 'utf8');

async function main() {
  console.log('Applying db/schema.sql ...');

  // `neon()` runs one statement per call, so split on statement boundaries.
  // The DO $$ ... $$ blocks contain semicolons, so those are handled first.
  const statements = splitStatements(ddl);

  for (const [index, statement] of statements.entries()) {
    const trimmed = statement.trim();
    if (!trimmed) continue;
    try {
      await sql.query(trimmed);
    } catch (error) {
      console.error(`\nFailed on statement #${index + 1}:\n${trimmed.slice(0, 200)}...\n`);
      throw error;
    }
  }

  console.log(`Done — ${statements.length} statements applied.\n`);
}

/** Split SQL into statements, keeping $$ ... $$ bodies intact. */
function splitStatements(source: string): string[] {
  const statements: string[] = [];
  let current = '';
  let depth = 0; // tracks $$ ... $$ pairing
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    const next = source[i + 1];

    if (inLineComment) {
      current += char;
      if (char === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        i++;
        inBlockComment = false;
      }
      continue;
    }
    if (char === '-' && next === '-') {
      inLineComment = true;
      current += char;
      continue;
    }
    if (char === '/' && next === '*') {
      inBlockComment = true;
      current += char;
      continue;
    }
    if (char === '$' && next === '$') {
      depth = depth === 0 ? 1 : 0;
      current += '$$';
      i++;
      continue;
    }
    if (char === ';' && depth === 0) {
      statements.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) statements.push(current);
  return statements;
}

main().catch((error) => {
  console.error('\nMigration failed:\n', error);
  process.exit(1);
});
