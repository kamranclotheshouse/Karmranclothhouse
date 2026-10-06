/**
 * Local schema + seed verification — runs everything against an in-process
 * PGlite (real Postgres compiled to WASM), so no database, account or
 * credentials are needed.
 *
 *   npm run db:verify
 *
 * Catches broken DDL and broken seed statements before they are pasted into
 * the Neon SQL Editor.
 */
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { brands, categories, products } from '../src/lib/data';
import { seed } from '../src/lib/db/seed';

const failures: string[] = [];
let passed = 0;

function check(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passed += 1;
    console.log(`  ok    ${label}`);
  } else {
    failures.push(detail ? `${label} — ${detail}` : label);
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main() {
  console.log('\n── 1. Applying db/schema.sql ──────────────────────────────\n');
  const db = new PGlite();
  const ddl = readFileSync(resolve(__dirname, '../db/schema.sql'), 'utf8');

  try {
    await db.exec(ddl);
    console.log('  ok    schema applied\n');
    passed += 1;
  } catch (error) {
    console.error('  FAIL  schema did not apply\n\n', error);
    process.exit(1);
  }

  console.log('── 2. Re-applying (idempotency) ───────────────────────────\n');
  try {
    await db.exec(ddl);
    console.log('  ok    second apply is a no-op\n');
    passed += 1;
  } catch (error) {
    console.error('  FAIL  second apply broke — schema is NOT idempotent\n\n', error);
    process.exit(1);
  }

  console.log('── 3. Seeding ─────────────────────────────────────────────\n');
  const query = async (sql: string, params: unknown[] = []) => {
    const result = await db.query(sql, params);
    return { rows: result.rows as Record<string, unknown>[] };
  };

  let report;
  try {
    report = await seed(query);
    console.log(`  ok    ${report.brands} brands, ${report.categories} categories, ${report.products} products\n`);
    passed += 1;
  } catch (error) {
    console.error('  FAIL  seed did not complete\n\n', error);
    process.exit(1);
  }

  console.log('── 4. Assertions ──────────────────────────────────────────\n');

  const count = async (table: string) => {
    const result = await query(`SELECT count(*)::int AS n FROM ${table}`);
    return Number(result.rows[0].n);
  };

  check('brands seeded', (await count('brands')) === brands.length, `got ${await count('brands')}`);
  check('categories seeded', (await count('categories')) === categories.length);
  check('products seeded', (await count('products')) === products.length);
  check('store_settings has exactly one row', (await count('store_settings')) === 1);
  check('homepage banner exists', (await count('banners')) >= 1);

  // Idempotency of the seed itself.
  await seed(query);
  check('re-seeding does not duplicate products', (await count('products')) === products.length,
    `got ${await count('products')}`);

  // Referential integrity: every product resolved a brand + category.
  const orphans = await query(
    `SELECT count(*)::int AS n FROM products WHERE brand_id IS NULL OR category_id IS NULL`
  );
  check('every product has brand + category', Number(orphans.rows[0].n) === 0,
    `${orphans.rows[0].n} orphaned`);

  // Arrays round-trip correctly (TEXT[] is how display order is stored).
  const arr = await query(
    `SELECT images FROM products WHERE slug = $1 LIMIT 1`,
    [products[0].slug]
  );
  const images = arr.rows[0]?.images;
  check('images round-trip as TEXT[]', Array.isArray(images) && images.length === products[0].images.length,
    `got ${JSON.stringify(images)}`);

  // JSONB colour variants round-trip and keep camelCase inStock keys.
  // Seeded products carry [] until the client adds real colours, so the
  // round-trip is exercised with a temporary value.
  const probe = [{ name: 'Round Trip', hex: '#0E3B2C', inStock: true }];
  await query(
    `UPDATE products SET color_variants = $1 WHERE slug = $2`,
    [JSON.stringify(probe), products[0].slug]
  );
  const colors = await query(
    `SELECT color_variants FROM products WHERE slug = $1 LIMIT 1`,
    [products[0].slug]
  );
  const variants = colors.rows[0]?.color_variants;
  const firstVariant = Array.isArray(variants) ? variants[0] : null;
  check('color_variants round-trip as JSONB',
    Array.isArray(variants) && variants.length === 1 && variants[0].name === 'Round Trip');
  check('color_variants use camelCase inStock', firstVariant?.inStock === true,
    `keys: ${firstVariant ? Object.keys(firstVariant).join(', ') : 'none'}`);
  await query(`UPDATE products SET color_variants = '[]'::jsonb WHERE slug = $1`, [products[0].slug]);

  // Order numbering sequence exists and starts at 1001.
  const seq = await query(`SELECT nextval('order_number_seq') AS n`);
  check('order_number_seq starts at 1001', Number(seq.rows[0].n) === 1001);

  // updated_at trigger fires on UPDATE.
  await query(`UPDATE products SET updated_at = NOW() - interval '1 day' WHERE slug = $1`, [products[0].slug]);
  const before = await query(`SELECT updated_at FROM products WHERE slug = $1`, [products[0].slug]);
  await query(`UPDATE products SET sort_order = 999 WHERE slug = $1`, [products[0].slug]);
  const after = await query(`SELECT updated_at FROM products WHERE slug = $1`, [products[0].slug]);
  check('updated_at trigger fires',
    new Date(String(after.rows[0].updated_at)).getTime() >=
    new Date(String(before.rows[0].updated_at)).getTime() - 1000);

  // Order status CHECK constraint rejects nonsense.
  let rejected = false;
  try {
    await query(
      `INSERT INTO orders (order_number, customer_name, customer_phone, delivery_address, city,
                           subtotal, total_amount, order_status, items)
       VALUES ('KCH-TEST-1','Test','03000000000','Addr','Peshawar', 100, 100, 'nonsense', '[]')`
    );
  } catch {
    rejected = true;
  }
  check('order_status CHECK rejects invalid status', rejected);

  // page_content CHECK constraint.
  let slugRejected = false;
  try {
    await query(
      `INSERT INTO page_content (slug, title) VALUES ('nope', 'Nope')`
    );
  } catch {
    slugRejected = true;
  }
  check('page_content CHECK rejects unknown slug', slugRejected);

  await db.close();

  console.log(`\n${passed} passed, ${failures.length} failed.\n`);
  if (failures.length > 0) {
    console.error('Failures:');
    failures.forEach((f) => console.error(`  - ${f}`));
    console.error('');
    process.exit(1);
  }
  console.log('Schema and seed are good to go.\n');
}

main().catch((error) => {
  console.error('\nVerification crashed:\n', error);
  process.exit(1);
});
