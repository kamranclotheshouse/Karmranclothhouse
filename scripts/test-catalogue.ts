/**
 * Exercise src/lib/db/catalogue.ts against a throwaway PGlite database.
 *
 *   npm run db:test
 *
 * Verifies the CRUD path end to end before it is wired to HTTP routes, so a
 * typo in a column name surfaces here instead of in the admin panel.
 */
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const DB_DIR = 'test-db';
process.env.KCH_DB_DIR = DB_DIR;

let failures = 0;
let passed = 0;

function check(label: string, condition: boolean, detail?: string): void {
  if (condition) {
    passed += 1;
    console.log(`  ok    ${label}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function main() {
  rmSync(resolve(process.cwd(), '.data', DB_DIR), { recursive: true, force: true });

  // Initialise the throwaway database and load the reference data the
  // assertions below expect to find.
  const { getQuery } = await import('../src/lib/db/driver');
  const { seed } = await import('../src/lib/db/seed');
  await seed((sql, params) => getQuery().then((run) => run(sql, params)));

  const {
    listProducts,
    getProductBySlug,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    listCategories,
    listBrands,
    slugify,
    slugIsTaken,
    NotFoundError,
  } = await import('../src/lib/db/catalogue');
  const { prepareOrderInput, createOrder, getOrderForTracking } = await import('../src/lib/db/orders');
  const { categories: seedCategories, brands: seedBrands, products: seedProducts } =
    await import('../src/lib/data');

  console.log('\n── lookup tables ─────────────────────────────────────────\n');

  const categories = await listCategories();
  const brands = await listBrands();

  check('categories readable', categories.length === seedCategories.length, `got ${categories.length}`);
  check('brands readable', brands.length === seedBrands.length, `got ${brands.length}`);
  check('category has image + subtitle',
    Boolean(categories[0].image) && Boolean(categories[0].sub));

  console.log('\n── existing seeded products ──────────────────────────────\n');

  const seeded = await listProducts();
  check('seeded products visible', seeded.length === seedProducts.length, `got ${seeded.length}`);
  check('brand/category resolved via join', Boolean(seeded[0].brandSlug && seeded[0].categorySlug),
    `${seeded[0].brandSlug} / ${seeded[0].categorySlug}`);
  check('price parsed as number', typeof seeded[0].price === 'number');
  check('images present', Array.isArray(seeded[0].images) && seeded[0].images.length > 0);
  // Seeded colours are [] until the client adds real ones — the array shape is
  // what matters here; the JSONB round-trip is covered by the create test below.
  check('colour variants field is an array', Array.isArray(seeded[0].colors),
    `got ${JSON.stringify(seeded[0].colors).slice(0, 80)}`);

  const bySlug = await getProductBySlug(seeded[0].slug);
  check('getProductBySlug matches list entry', bySlug?.name === seeded[0].name);
  check('getProductBySlug returns null for unknown', (await getProductBySlug('nope')) === null);

  const preparedOrder = await prepareOrderInput({
    customerName: 'Ali Khan',
    customerPhone: '03001234567',
    deliveryAddress: 'House 12, Street 4, Gulberg',
    city: 'Peshawar',
    // Deliberately forged values: only slug + quantity may influence the
    // server-calculated order price.
    subtotal: 1,
    deliveryCharges: 0,
    items: [{
      slug: seeded[0].slug,
      title: 'Forged title',
      brand: 'Forged brand',
      color: '',
      quantity: 1,
      price: 1,
      image: 'https://attacker.invalid/image.jpg',
    }],
  });
  check(
    'order price comes from the catalogue',
    preparedOrder.input?.items[0].price === seeded[0].price &&
      preparedOrder.input.subtotal === seeded[0].price
  );
  check(
    'order display data comes from the catalogue',
    preparedOrder.input?.items[0].title === seeded[0].name &&
      preparedOrder.input?.items[0].brand === seeded[0].brand
  );
  check(
    'unknown product is rejected before order creation',
    Boolean(
      (
        await prepareOrderInput({
          customerName: 'Ali Khan',
          customerPhone: '03001234567',
          deliveryAddress: 'House 12, Street 4, Gulberg',
          city: 'Peshawar',
          subtotal: 0,
          deliveryCharges: 0,
          items: [
            { slug: 'missing-product', title: '', brand: '', color: '', quantity: 1, price: 0, image: '' },
          ],
        })
      ).error
    )
  );
  if (preparedOrder.input) {
    const createdOrder = await createOrder(preparedOrder.input);
    check(
      'tracking needs the matching customer phone number',
      (await getOrderForTracking(createdOrder.orderNumber, '03001234567'))?.orderNumber ===
        createdOrder.orderNumber &&
        (await getOrderForTracking(createdOrder.orderNumber, '03009999999')) === null
    );
  } else {
    check('tracking needs the matching customer phone number', false);
  }

  console.log('\n── create ────────────────────────────────────────────────\n');

  const slug = slugify('Test Kurta  —  Emerald  ');
  check('slugify', slug === 'test-kurta-emerald', `got ${slug}`);

  const created = await createProduct({
    title: 'Test Kurta — Emerald',
    slug,
    brandSlug: brands[0].slug,
    categorySlug: categories[0].slug,
    description: 'A product created by the test suite.',
    fabricType: 'Cotton',
    fabricLength: '4.5 Meters',
    fabricWidth: '54 Inches',
    season: 'Summer',
    weaveType: 'Plain',
    price: 4500,
    compareAtPrice: 5200,
    badge: 'New Arrival',
    images: ['/images/a.jpg', '/images/b.jpg'],
    imageAlt: 'Emerald kurta fabric',
    colorVariants: [
      { name: 'Emerald', hex: '#0A4D3C', inStock: true },
      { name: 'Ivory', hex: '#F2EBDD', inStock: false },
    ],
    isFeatured: true,
    stockQuantity: 12,
  });

  check('create returns a row', Boolean(created.id));
  check('brand joined back', created.brandSlug === brands[0].slug, created.brandSlug);
  check('category joined back', created.categorySlug === categories[0].slug, created.categorySlug);
  check('price stored', created.price === 4500, `got ${created.price}`);
  check('compare price stored', created.compareAtPrice === 5200);
  check('images stored as array of 2', created.images.length === 2);
  check('colour variants stored with inStock',
    created.colors.length === 2 && created.colors[1].inStock === false);
  check('defaults applied', created.isInStock === true && created.stockQuantity === 12);
  check('slug taken after create', (await slugIsTaken(slug)) === true);
  check('unrelated slug free', (await slugIsTaken('totally-free-slug')) === false);

  console.log('\n── duplicate slug rejected ───────────────────────────────\n');

  let dupRejected = false;
  try {
    await createProduct({ title: 'Duplicate', slug, price: 100 });
  } catch {
    dupRejected = true;
  }
  check('duplicate slug throws', dupRejected);

  console.log('\n── update (partial) ──────────────────────────────────────\n');

  const patched = await updateProduct(created.id, { title: 'Renamed', price: 5000 });
  check('partial patch changed title', patched.name === 'Renamed', patched.name);
  check('partial patch changed price', patched.price === 5000, String(patched.price));
  check('untouched fields survived', patched.images.length === 2 && patched.badge === 'New Arrival');

  const stockOnly = await updateProduct(created.id, { isInStock: false, stockQuantity: 0 });
  check('stock toggle', stockOnly.isInStock === false && stockOnly.stockQuantity === 0);
  check('stock toggle left price alone', stockOnly.price === 5000);

  const cleared = await updateProduct(created.id, { badge: null, compareAtPrice: null });
  check('nullable fields clear', cleared.badge === undefined && cleared.compareAtPrice === undefined);

  const empty = await updateProduct(created.id, {});
  check('empty patch is a no-op, not an error', empty.name === 'Renamed');

  console.log('\n── not found ─────────────────────────────────────────────\n');

  let missing = false;
  try {
    await updateProduct('00000000-0000-0000-0000-000000000000', { title: 'x' });
  } catch (error) {
    missing = error instanceof NotFoundError;
  }
  check('updating a missing id throws NotFoundError', missing);

  let deleteMissing = false;
  try {
    await deleteProduct('00000000-0000-0000-0000-000000000000');
  } catch (error) {
    deleteMissing = error instanceof NotFoundError;
  }
  check('deleting a missing id throws NotFoundError', deleteMissing);

  console.log('\n── delete ────────────────────────────────────────────────\n');

  await deleteProduct(created.id);
  check('product gone', (await getProductById(created.id)) === null);
  check('slug freed after delete', (await slugIsTaken(slug)) === false);
  check('seeded count unaffected', (await listProducts()).length === seedProducts.length);

  console.log(`\n${passed} passed, ${failures} failed.\n`);
  if (failures > 0) process.exit(1);
}

main().catch((error) => {
  console.error('\nTest crashed:\n', error);
  process.exit(1);
});
