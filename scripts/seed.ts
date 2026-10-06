/**
 * Seed the Neon database from the static catalogue in src/lib/data.ts.
 *
 *   NEON_DATABASE_URL="postgresql://..." npm run db:seed
 *
 * Idempotent — safe to re-run. The actual SQL lives in src/lib/db/seed.ts so
 * the same statements can be exercised locally by ./verify-db.ts.
 */
import './env';
import { neon } from '@neondatabase/serverless';
import { seed } from '../src/lib/db/seed';

const url = process.env.NEON_DATABASE_URL;
if (!url) {
  console.error(
    '\n  NEON_DATABASE_URL is not set.\n\n  Run:\n    NEON_DATABASE_URL="postgresql://..." npm run db:seed\n'
  );
  process.exit(1);
}

const sql = neon(url);

async function main() {
  console.log('Seeding...');
  // Routes to AWS ap-southeast-1 can be flaky — retry transient connect
  // failures per statement instead of aborting the whole (idempotent) run.
  const report = await seed(async (statement, params = []) => {
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const rows = await sql.query(statement, params);
        return { rows: rows as Record<string, unknown>[] };
      } catch (error) {
        lastError = error;
        const transient =
          String(error).includes('fetch failed') || String(error).includes('ConnectTimeout');
        if (!transient || attempt === 5) throw error;
        await new Promise((r) => setTimeout(r, attempt * 1500));
      }
    }
    throw lastError;
  });

  console.log(`  ${report.brands} brands`);
  console.log(`  ${report.categories} categories`);
  console.log(`  ${report.products} products`);
  console.log(`  store settings + homepage banner updated`);

  console.log('\nDone. Verify with:');
  console.log('  SELECT count(*) FROM products;\n');
}

main().catch((error) => {
  console.error('\nSeed failed:\n', error);
  process.exit(1);
});
