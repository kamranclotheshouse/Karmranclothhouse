/**
 * Loads `.env.local` for the plain `tsx` scripts.
 *
 * Next.js reads it automatically, but `npm run db:migrate` and friends run as
 * ordinary Node processes and would otherwise see an empty environment.
 *
 *   import './env';
 *
 * Must be the first import in a script — later imports may read the values.
 */
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const file = resolve(__dirname, '..', '.env.local');

if (existsSync(file)) {
  process.loadEnvFile(file);
}
