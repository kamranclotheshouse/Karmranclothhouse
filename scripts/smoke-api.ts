/**
 * End-to-end smoke test of the admin product API.
 *
 *   npm run smoke:api
 *
 * Boots `next dev`, signs in, then drives create → read → update → delete
 * over real HTTP. Uses the local PGlite database, so no credentials are
 * needed. Proves the route handlers, validation and data layer work together
 * rather than only in isolation.
 */
import { execSync, spawn, type ChildProcess } from 'node:child_process';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  products as SEED_PRODUCTS,
  brands as SEED_BRANDS,
  categories as SEED_CATEGORIES,
} from '../src/lib/data';

const PORT = 3210;
const BASE = `http://localhost:${PORT}`;
const DB_DIR = 'smoke-db';

let server: ChildProcess | null = null;
let passed = 0;
let failed = 0;

function check(label: string, condition: boolean, detail = ''): void {
  if (condition) {
    passed += 1;
    console.log(`  ok    ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label}${detail ? ` — ${detail}` : ''}`);
  }
}

async function waitForServer(timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastLog = 0;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) return;
      if (Date.now() - lastLog > 5000) {
        lastLog = Date.now();
        console.log(`  waiting: got HTTP ${res.status}`);
      }
    } catch (error) {
      if (Date.now() - lastLog > 5000) {
        lastLog = Date.now();
        console.log(
          `  waiting: ${(error as { cause?: { code?: string } }).cause?.code ?? (error as Error).message}`
        );
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Dev server did not start within ${timeoutMs}ms`);
}

/** PIDs currently listening on `port` — `[]` if nothing is there. */
async function listenersOn(port: number): Promise<number[]> {
  if (process.platform !== 'win32') return [];
  try {
    const out = execSync(
      `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue).OwningProcess"`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }
    ).trim();
    return out
      .split(/\s+/)
      .filter(Boolean)
      .map(Number)
      .filter((n) => Number.isInteger(n) && n > 0);
  } catch {
    return [];
  }
}

function killTree(pid: number): void {
  try {
    // `kill()` only ends the wrapping cmd.exe on Windows; /T takes the tree.
    execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' });
  } catch {
    // already gone
  }
}

/**
 * A previous run that was killed badly leaves the port occupied. Loop until it
 * is genuinely free — a single attempt is not enough, because taskkill returns
 * before the socket is released.
 */
async function freePort(): Promise<void> {
  if (process.platform !== 'win32') return;
  for (let attempt = 0; attempt < 10; attempt++) {
    const pids = await listenersOn(PORT);
    if (pids.length === 0) return;
    console.log(`  port ${PORT} held by ${pids.join(', ')} — clearing…`);
    for (const pid of pids) killTree(pid);
    await new Promise((r) => setTimeout(r, 1000));
  }
  const still = await listenersOn(PORT);
  if (still.length > 0) {
    throw new Error(`Port ${PORT} is still held by ${still.join(', ')} — cannot run a clean test.`);
  }
}

async function stopServer(): Promise<void> {
  if (server?.pid) {
    if (process.platform === 'win32') {
      killTree(server.pid);
    } else {
      server.kill();
    }
    server = null;
  }

  // `shell: true` makes `server.pid` the wrapping cmd.exe; `npx` may spawn the
  // real listener as a child that taskkill does not always take with it. Kill
  // whatever is actually holding the port, or the next run inherits a stale one.
  for (let attempt = 0; attempt < 10; attempt++) {
    const pids = await listenersOn(PORT);
    if (pids.length === 0) return;
    for (const pid of pids) killTree(pid);
    await new Promise((r) => setTimeout(r, 500));
  }
}

async function main() {
  // Kill first, wipe second. The order matters: a still-running server holds
  // the PGlite files open (Windows refuses to delete them) and can rewrite the
  // directory after it has been cleared, leaving rows from the last run behind.
  await freePort();
  rmSync(resolve(process.cwd(), '.data', DB_DIR), { recursive: true, force: true });

  console.log('\nStarting dev server...');

  // The smoke test must run against its own throw-away PGlite database, never
  // against Neon. `NEON_DATABASE_URL` comes in via `.env.local`, so it has to be
  // neutralised explicitly — an empty string counts as "set" for Next's env
  // loader (so it is not re-loaded) and as "falsy" for the driver (so PGlite wins).
  const childEnv: NodeJS.ProcessEnv = { ...process.env, KCH_DB_DIR: DB_DIR };
  childEnv.NEON_DATABASE_URL = '';

  server = spawn(`npx next dev -p ${PORT}`, {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: childEnv,
    shell: true,
  });

  let serverLog = '';
  server.stdout?.on('data', (d) => (serverLog += d));
  server.stderr?.on('data', (d) => (serverLog += d));

  try {
    await waitForServer();

    // Proof that we are talking to *our* server: only this run uses KCH_DB_DIR
    // = smoke-db, and the home page reads the database. If an orphan from an
    // earlier run still owns the port, our spawn never bound and this directory
    // is never created — every assertion would silently run against stale data.
    if (!existsSync(resolve(process.cwd(), '.data', DB_DIR))) {
      throw new Error(
        `Port ${PORT} is serving something other than this run (no .data/${DB_DIR}). ` +
          'A previous dev server is still alive — kill it and retry.'
      );
    }

    console.log('  ready\n');

    // ── sign in ────────────────────────────────────────────────────────────
    console.log('── auth ─────────────────────────────────────────────────\n');

    const badLogin = await fetch(`${BASE}/api/admin/auth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pin: '0000' }),
    });
    check('wrong PIN rejected', badLogin.status === 401, `got ${badLogin.status}`);

    const unauth = await fetch(`${BASE}/api/admin/products`);
    check('products require sign-in', unauth.status === 401, `got ${unauth.status}`);

    const login = await fetch(`${BASE}/api/admin/auth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pin: process.env.ADMIN_PIN || '1990' }),
    });
    check('correct PIN accepted', login.status === 200, `got ${login.status}`);

    const cookie = login.headers.get('set-cookie')?.split(';')[0] ?? '';
    const authed = { cookie };
    const jsonHeaders = { 'content-type': 'application/json', cookie };

    // ── read ───────────────────────────────────────────────────────────────
    console.log('\n── list ─────────────────────────────────────────────────\n');

    const listRes = await fetch(`${BASE}/api/admin/products`, { headers: authed });
    check('list returns 200', listRes.status === 200, `got ${listRes.status}`);
    const list = await listRes.json();
    check('list reports ok', list.ok === true);
    check('seeded products', Array.isArray(list.products) && list.products.length === SEED_PRODUCTS.length,
      `got ${list.products?.length}`);
    check('brands included for the form', list.brands?.length === SEED_BRANDS.length, `got ${list.brands?.length}`);
    check('categories included for the form', list.categories?.length === SEED_CATEGORIES.length,
      `got ${list.categories?.length}`);

    // ── admin pages render ─────────────────────────────────────────────────
    console.log('\n── admin pages ───────────────────────────────────────────\n');

    const existingId = list.products[0].id;
    const existingName = list.products[0].name;

    const listPage = await fetch(`${BASE}/admin/products`, { headers: authed });
    const listHtml = await listPage.text();
    check('product list page 200', listPage.status === 200, `got ${listPage.status}`);
    check('list page shows Add Product', listHtml.includes('Add Product'));
    check('list page shows a real product', listHtml.includes(existingName),
      `looking for "${existingName}"`);
    check('list page offers search', listHtml.includes('dhoondein'));

    const newPage = await fetch(`${BASE}/admin/products/new`, { headers: authed });
    const newHtml = await newPage.text();
    check('new product page 200', newPage.status === 200, `got ${newPage.status}`);
    check('form is numbered (step 1..7)',
      newHtml.includes('Basic Info') && newHtml.includes('Description') && newHtml.includes('Preview'));
    check('form carries helper text', newHtml.includes('jaise 4500'));
    check('form offers a way back', newHtml.includes('Wapas list pe'));

    const editPage = await fetch(`${BASE}/admin/products/${existingId}`, { headers: authed });
    const editHtml = await editPage.text();
    check('edit page 200', editPage.status === 200, `got ${editPage.status}`);
    check('edit page prefilled with the product',
      editHtml.includes('Edit Product') && editHtml.includes(`value="${existingName}"`),
      `expected value="${existingName}" in the rendered form`);

    const missingPage = await fetch(`${BASE}/admin/products/00000000-0000-0000-0000-000000000000`, {
      headers: authed,
    });
    check('unknown product id 404s', missingPage.status === 404, `got ${missingPage.status}`);

    // ── validation ─────────────────────────────────────────────────────────
    console.log('\n── validation ────────────────────────────────────────────\n');

    const invalid = await fetch(`${BASE}/api/admin/products`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ title: '', slug: '', price: 'not a number' }),
    });
    check('invalid payload returns 422', invalid.status === 422, `got ${invalid.status}`);
    const invalidBody = await invalid.json();
    check('field errors returned', Boolean(invalidBody.errors?.title && invalidBody.errors?.price),
      JSON.stringify(invalidBody.errors ?? {}));
    check('price error suggests an example', String(invalidBody.errors?.price).includes('4500'),
      invalidBody.errors?.price);

    const badSlug = await fetch(`${BASE}/api/admin/products`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ title: 'Slug Test', slug: 'Bad Slug!', price: '1000' }),
    });
    const badSlugBody = await badSlug.json();
    check('invalid slug rejected with a hint',
      badSlug.status === 422 && String(badSlugBody.errors?.slug).includes('royal-karandi'),
      badSlugBody.errors?.slug);

    // ── create ─────────────────────────────────────────────────────────────
    console.log('\n── create / read / update / delete ───────────────────────\n');

    const createdRes = await fetch(`${BASE}/api/admin/products`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({
        title: 'Smoke Test Suit',
        slug: 'smoke-test-suit',
        price: '4500',
        compareAtPrice: '5200',
        stockQuantity: '9',
        brandSlug: list.brands[0].slug,
        categorySlug: list.categories[0].slug,
        description: 'Created by the API smoke test.',
        fabricType: 'Cotton',
        badge: 'New Arrival',
        images: ['/images/hero.jpg'],
        colorVariants: [{ name: 'Ivory', hex: '#F5F1E6', inStock: true }],
        isFeatured: true,
      }),
    });
    check('create returns 201', createdRes.status === 201, `got ${createdRes.status}`);
    const createdBody = await createdRes.json();
    const id = createdBody.product?.id;
    check('create returns the row', Boolean(id));
    check('joined brand came back', createdBody.product?.brandSlug === list.brands[0].slug);
    check('numeric fields parsed', createdBody.product?.price === 4500
      && createdBody.product?.compareAtPrice === 5200);
    check('stock parsed', createdBody.product?.stockQuantity === 9);
    check('images kept', createdBody.product?.images?.length === 1);
    check('colour variants kept', createdBody.product?.colors?.[0]?.inStock === true);

    const dup = await fetch(`${BASE}/api/admin/products`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ title: 'Dup', slug: 'smoke-test-suit', price: '100' }),
    });
    check('duplicate slug returns 422', dup.status === 422, `got ${dup.status}`);

    const getRes = await fetch(`${BASE}/api/admin/products/${id}`, { headers: authed });
    check('read by id returns 200', getRes.status === 200, `got ${getRes.status}`);
    const got = await getRes.json();
    check('read matches create', got.product?.name === 'Smoke Test Suit');

    const patchRes = await fetch(`${BASE}/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ title: 'Smoke Test Suit (edited)', isInStock: false }),
    });
    check('patch returns 200', patchRes.status === 200, `got ${patchRes.status}`);
    const patched = await patchRes.json();
    check('patched title', patched.product?.name === 'Smoke Test Suit (edited)');
    check('patched stock flag', patched.product?.isInStock === false);
    check('untouched price survived patch', patched.product?.price === 4500);

    const listAfterCreate = await (await fetch(`${BASE}/api/admin/products`, { headers: authed })).json();
    check('list grew by one', listAfterCreate.products.length === SEED_PRODUCTS.length + 1,
      `got ${listAfterCreate.products.length}`);

    // ── the admin → storefront loop ────────────────────────────────────────
    console.log('\n── storefront reads the database ────────────────────────\n');

    const homeRes = await fetch(`${BASE}/`);
    const homeHtml = await homeRes.text();
    check('home page 200', homeRes.status === 200, `got ${homeRes.status}`);
    // The home rail shows the top of the bestseller list (sort_order, title) —
    // assert the DB-driven rail renders seeded data rather than a just-created
    // product, which would only appear if it happened to sort into the top 4.
    const topBestseller = SEED_PRODUCTS.filter((p) => p.isBestseller)
      .map((p) => p.name)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 4);
    check('home shows the bestseller rail', topBestseller.some((name) => homeHtml.includes(name)),
      `none of ${topBestseller.join(' | ')} found on home`);

    const productPage = await fetch(`${BASE}/product/smoke-test-suit`);
    const productHtml = await productPage.text();
    check('product page 200', productPage.status === 200, `got ${productPage.status}`);
    check('product page shows the admin title', productHtml.includes('Smoke Test Suit (edited)'));
    check('product page shows the admin price', productHtml.includes('4,500'));

    const categoryPage = await fetch(`${BASE}/categories/${list.categories[0].slug}`);
    const categoryHtml = await categoryPage.text();
    check('category page lists the new product', categoryHtml.includes('Smoke Test Suit (edited)'));

    const brandPage = await fetch(`${BASE}/brands/${list.brands[0].slug}`);
    const brandHtml = await brandPage.text();
    check('brand page lists the new product', brandHtml.includes('Smoke Test Suit (edited)'));

    const deleteRes = await fetch(`${BASE}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: authed,
    });
    check('delete returns 200', deleteRes.status === 200, `got ${deleteRes.status}`);

    const gone = await fetch(`${BASE}/api/admin/products/${id}`, { headers: authed });
    check('read after delete returns 404', gone.status === 404, `got ${gone.status}`);

    const gonePage = await fetch(`${BASE}/product/smoke-test-suit`);
    check('deleted product 404s on the storefront', gonePage.status === 404,
      `got ${gonePage.status}`);

    const deleteAgain = await fetch(`${BASE}/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: authed,
    });
    check('deleting twice returns 404', deleteAgain.status === 404, `got ${deleteAgain.status}`);

    const listFinal = await (await fetch(`${BASE}/api/admin/products`, { headers: authed })).json();
    check('back to the seeded count', listFinal.products.length === SEED_PRODUCTS.length,
      `got ${listFinal.products.length}`);

    // ── categories & brands CRUD ───────────────────────────────────────────
    console.log('\n── categories & brands ─────────────────────────────────\n');

    const catsUnauth = await fetch(`${BASE}/api/admin/categories`);
    check('category list requires sign-in', catsUnauth.status === 401, `got ${catsUnauth.status}`);

    const cats = await (await fetch(`${BASE}/api/admin/categories`, { headers: authed })).json();
    check('seeded categories', cats.categories?.length === SEED_CATEGORIES.length, `got ${cats.categories?.length}`);
    check('categories carry product counts', typeof cats.categories?.[0]?.productCount === 'number');

    const noName = await fetch(`${BASE}/api/admin/categories`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name: '', slug: '' }),
    });
    check('empty category name rejected', noName.status === 422, `got ${noName.status}`);
    const noNameBody = await noName.json();
    check('category error suggests an example', /Winter Fabric/.test(noNameBody.errors?.name ?? ''),
      noNameBody.errors?.name);

    const badImage = await fetch(`${BASE}/api/admin/categories`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'Smoke Cat', slug: 'smoke-cat', image: 'not a url' }),
    });
    check('category image must be a URL', badImage.status === 422, `got ${badImage.status}`);

    const newCatRes = await fetch(`${BASE}/api/admin/categories`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'Smoke Category', slug: 'smoke-category', sub: 'Just for tests' }),
    });
    const newCatBody = await newCatRes.json();
    check('create category 201', newCatRes.status === 201, `got ${newCatRes.status}`);
    const catId = newCatBody.category?.id;
    check('category is live by default', newCatBody.category?.isActive === true);

    const dupCat = await fetch(`${BASE}/api/admin/categories`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'Dup Cat', slug: 'smoke-category' }),
    });
    check('duplicate category slug 422', dupCat.status === 422, `got ${dupCat.status}`);

    const catPage = await fetch(`${BASE}/categories/smoke-category`);
    check('new category page 200', catPage.status === 200, `got ${catPage.status}`);
    check('category page shows its title', (await catPage.text()).includes('Smoke Category'));

    const catPatch = await fetch(`${BASE}/api/admin/categories/${catId}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'Smoke Category Edited', isActive: false }),
    });
    check('update category 200', catPatch.status === 200, `got ${catPatch.status}`);
    check('category rename applied', (await catPatch.json()).category?.name === 'Smoke Category Edited');

    const hiddenCat = await fetch(`${BASE}/categories`);
    check('hidden category leaves the storefront', !(await hiddenCat.text()).includes('Smoke Category Edited'));

    const catDel = await fetch(`${BASE}/api/admin/categories/${catId}`, {
      method: 'DELETE',
      headers: authed,
    });
    check('delete category 200', catDel.status === 200, `got ${catDel.status}`);
    const goneCat = await fetch(`${BASE}/api/admin/categories/${catId}`, { headers: authed });
    check('category gone 404', goneCat.status === 404, `got ${goneCat.status}`);

    const brands = await (await fetch(`${BASE}/api/admin/brands`, { headers: authed })).json();
    check('seeded brands', brands.brands?.length === SEED_BRANDS.length, `got ${brands.brands?.length}`);

    const newBrandRes = await fetch(`${BASE}/api/admin/brands`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ name: 'Smoke Brand', slug: 'smoke-brand', sub: 'Test tagline', isFeatured: true }),
    });
    const newBrandBody = await newBrandRes.json();
    check('create brand 201', newBrandRes.status === 201, `got ${newBrandRes.status}`);
    const brandId = newBrandBody.brand?.id;
    check('brand featured flag honoured', newBrandBody.brand?.isFeatured === true);

    const brandPage2 = await fetch(`${BASE}/brands/smoke-brand`);
    check('new brand page 200', brandPage2.status === 200, `got ${brandPage2.status}`);

    const brandPatch = await fetch(`${BASE}/api/admin/brands/${brandId}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ tag: 'Updated tagline' }),
    });
    check('update brand 200', brandPatch.status === 200, `got ${brandPatch.status}`);

    const brandDel = await fetch(`${BASE}/api/admin/brands/${brandId}`, {
      method: 'DELETE',
      headers: authed,
    });
    check('delete brand 200', brandDel.status === 200, `got ${brandDel.status}`);

    const brandsFinal = await (await fetch(`${BASE}/api/admin/brands`, { headers: authed })).json();
    check('brands back to the seeded count', brandsFinal.brands.length === SEED_BRANDS.length, `got ${brandsFinal.brands.length}`);

    const catsAdminPage = await fetch(`${BASE}/admin/categories`, { headers: authed });
    const catsAdminHtml = await catsAdminPage.text();
    check('categories admin page 200', catsAdminPage.status === 200, `got ${catsAdminPage.status}`);
    check('categories page offers helper text', catsAdminHtml.includes('Customers see this'));

    const brandsAdminPage = await fetch(`${BASE}/admin/brands`, { headers: authed });
    const brandsAdminHtml = await brandsAdminPage.text();
    check('brands admin page 200', brandsAdminPage.status === 200, `got ${brandsAdminPage.status}`);
    check('brands page offers helper text', brandsAdminHtml.includes('Tagline'));

    // ── settings: admin form → database → storefront ──────────────────────
    console.log('\n── settings ─────────────────────────────────────────────\n');

    const settingsUnauth = await fetch(`${BASE}/api/admin/settings`);
    check('settings need sign-in', settingsUnauth.status === 401, `got ${settingsUnauth.status}`);

    const settingsRes = await fetch(`${BASE}/api/admin/settings`, { headers: authed });
    const settingsBody = await settingsRes.json();
    const original = settingsBody.settings;
    check('GET settings 200', settingsRes.status === 200, `got ${settingsRes.status}`);
    check('seeded store name', original?.storeName === 'Kamran Cloth House',
      `got ${original?.storeName}`);
    check('seeded delivery charge', original?.deliveryCharge === 250,
      `got ${original?.deliveryCharge}`);

    const emptyName = await fetch(`${BASE}/api/admin/settings`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ ...original, storeName: '   ' }),
    });
    const emptyNameBody = await emptyName.json();
    check('blank store name 422', emptyName.status === 422, `got ${emptyName.status}`);
    check('name error explains itself',
      /zaroori/.test(emptyNameBody.errors?.storeName ?? ''),
      `got ${emptyNameBody.errors?.storeName}`);

    const badLink = await fetch(`${BASE}/api/admin/settings`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ ...original, mapUrl: 'not-a-url' }),
    });
    check('malformed map link 422', badLink.status === 422, `got ${badLink.status}`);

    const settingsSaved = await fetch(`${BASE}/api/admin/settings`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({
        ...original,
        storeName: 'Smoke Test Store',
        announcementEnabled: true,
        announcementText: 'SMOKE ANNOUNCEMENT STRIP',
        deliveryCharge: 999,
        freeDeliveryThreshold: 7777,
      }),
    });
    const settingsSavedBody = await settingsSaved.json();
    check('save settings 200', settingsSaved.status === 200, `got ${settingsSaved.status}`);
    check('saved delivery charge', settingsSavedBody.settings?.deliveryCharge === 999,
      `got ${settingsSavedBody.settings?.deliveryCharge}`);

    const homeAfterSave = await (await fetch(`${BASE}/`)).text();
    check('storefront picks up the announcement', homeAfterSave.includes('SMOKE ANNOUNCEMENT STRIP'));
    check('storefront picks up the store name', homeAfterSave.includes('Smoke Test Store'));

    const settingsAdminPage = await fetch(`${BASE}/admin/settings`, { headers: authed });
    const settingsAdminHtml = await settingsAdminPage.text();
    check('settings admin page 200', settingsAdminPage.status === 200,
      `got ${settingsAdminPage.status}`);
    check('settings page offers helper text', settingsAdminHtml.includes('Free delivery above'));

    const restore = await fetch(`${BASE}/api/admin/settings`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify(original),
    });
    check('settings restored', restore.status === 200, `got ${restore.status}`);
    check('restore put the charge back', (await restore.json()).settings?.deliveryCharge === 250);

    const restoredHome = await (await fetch(`${BASE}/`)).text();
    check('storefront back to the default announcement',
      !restoredHome.includes('SMOKE ANNOUNCEMENT STRIP'));

    const contactHtml = await (await fetch(`${BASE}/contact`)).text();
    check('contact page shows the stored address', contactHtml.includes(original.address));
    check('contact page uses the stored WhatsApp number',
      contactHtml.includes(`wa.me/${original.whatsappNumber}`),
      'contact page is still hardcoding a WhatsApp number');

    // ── homepage hero: admin form → database → storefront ─────────────────
    console.log('\n── homepage ──────────────────────────────────────────────\n');

    const heroUnauth = await fetch(`${BASE}/api/admin/home`);
    check('hero endpoint needs sign-in', heroUnauth.status === 401, `got ${heroUnauth.status}`);

    const heroRes = await fetch(`${BASE}/api/admin/home`, { headers: authed });
    const heroBody = await heroRes.json();
    const originalSlides = heroBody.hero; // carousel: an array of slides
    check('GET hero 200', heroRes.status === 200, `got ${heroRes.status}`);
    check('hero is a slide array', Array.isArray(originalSlides) && originalSlides.length >= 1,
      `got ${JSON.stringify(originalSlides)?.slice(0, 80)}`);
    check('seeded hero heading', originalSlides?.[0]?.titleLine1 === "Peshawar's",
      `got ${originalSlides?.[0]?.titleLine1}`);

    const blankHeading = await fetch(`${BASE}/api/admin/home`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({
        slides: originalSlides.map((s: Record<string, unknown>, i: number) =>
          i === 0 ? { ...s, titleLine1: '   ' } : s
        ),
      }),
    });
    const blankHeadingBody = await blankHeading.json();
    check('blank hero heading 422', blankHeading.status === 422, `got ${blankHeading.status}`);
    check('hero error is Hinglish',
      /zaroori/.test(blankHeadingBody.errors?.['slides[0]']?.titleLine1 ?? ''),
      `got ${blankHeadingBody.errors?.['slides[0]']?.titleLine1}`);

    const badHeroLink = await fetch(`${BASE}/api/admin/home`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({
        slides: originalSlides.map((s: Record<string, unknown>, i: number) =>
          i === 0 ? { ...s, ctaPrimaryHref: 'winter fabric' } : s
        ),
      }),
    });
    check('hero link without / rejected', badHeroLink.status === 422,
      `got ${badHeroLink.status}`);

    const heroSaved = await fetch(`${BASE}/api/admin/home`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({
        slides: originalSlides.map((s: Record<string, unknown>, i: number) =>
          i === 0
            ? {
                ...s,
                eyebrow: 'SMOKE EYEBROW LINE',
                titleLine1: 'Smoke Heading One',
                subtitle: 'A subtitle written by the smoke test to prove the row is editable.',
                ctaPrimaryLabel: 'Smoke Button',
                ctaPrimaryHref: '/categories/kapra',
              }
            : s
        ),
      }),
    });
    check('save hero 200', heroSaved.status === 200, `got ${heroSaved.status}`);

    const homeAfterHero = await (await fetch(`${BASE}/`)).text();
    check('hero eyebrow reaches the storefront', homeAfterHero.includes('SMOKE EYEBROW LINE'));
    check('hero heading reaches the storefront', homeAfterHero.includes('Smoke Heading One'));
    check('hero button label reaches the storefront', homeAfterHero.includes('Smoke Button'));

    const heroAdminPage = await fetch(`${BASE}/admin/banners`, { headers: authed });
    const heroAdminHtml = await heroAdminPage.text();
    check('homepage editor page 200', heroAdminPage.status === 200,
      `got ${heroAdminPage.status}`);
    check('homepage editor offers helper text', heroAdminHtml.includes('Restore default'));

    const heroRestore = await fetch(`${BASE}/api/admin/home`, {
      method: 'PUT',
      headers: jsonHeaders,
      body: JSON.stringify({ slides: originalSlides }),
    });
    check('hero restored', heroRestore.status === 200, `got ${heroRestore.status}`);
    check('hero heading restored',
      (await heroRestore.json()).hero?.slides?.[0]?.titleLine1 === "Peshawar's");

    const homeRestored = await (await fetch(`${BASE}/`)).text();
    check('storefront back to the original hero', !homeRestored.includes('SMOKE EYEBROW LINE'));

    // ── orders: checkout → database → admin ────────────────────────────────
    console.log('\n── orders ───────────────────────────────────────────────\n');

    const orderPayload = {
      customerName: 'Test Customer',
      customerPhone: '03001234567',
      deliveryAddress: 'House 12, Street 4, Gulberg III',
      city: 'Lahore',
      subtotal: 4500,
      deliveryCharges: 0,
      items: [
        {
          slug: 'royal-karandi-charcoal',
          title: 'Royal Karandi — Charcoal Grey',
          brand: 'Gul Ahmed',
          color: 'Charcoal',
          quantity: 1,
          price: 4500,
          image: '/images/product-01.jpg',
        },
      ],
    };

    const createRes = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });
    const created = await createRes.json();
    check('checkout POST needs no sign-in', createRes.status === 201, `got ${createRes.status}`);
    check('order number issued', /^KCH-\d+$/.test(created.order?.orderNumber ?? ''),
      `got ${created.order?.orderNumber}`);
    check('order starts pending', created.order?.status === 'pending',
      `got ${created.order?.status}`);
    check('server recomputed the total', created.order?.totalAmount === 4500,
      `got ${created.order?.totalAmount}`);
    const orderNumber = created.order?.orderNumber as string;

    const badPhone = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...orderPayload, customerPhone: '12345' }),
    });
    const badPhoneBody = await badPhone.json();
    check('bad phone returns 422', badPhone.status === 422, `got ${badPhone.status}`);
    check('phone error names a valid example',
      /03XXXXXXXXX/.test(badPhoneBody.fields?.customerPhone ?? ''),
      `got ${badPhoneBody.fields?.customerPhone}`);

    const badCity = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...orderPayload, city: 'Atlantis' }),
    });
    check('unknown city rejected', badCity.status === 422, `got ${badCity.status}`);

    const tampered = await fetch(`${BASE}/api/orders`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...orderPayload, subtotal: 100 }),
    });
    check('subtotal tampering rejected', tampered.status === 422, `got ${tampered.status}`);

    const adminOrdersUnauth = await fetch(`${BASE}/api/orders`);
    check('order list requires sign-in', adminOrdersUnauth.status === 401,
      `got ${adminOrdersUnauth.status}`);

    const adminOrders = await (await fetch(`${BASE}/api/orders`, { headers: authed })).json();
    check('admin sees the new order',
      Array.isArray(adminOrders.orders) &&
        adminOrders.orders.some((o: { orderNumber: string }) => o.orderNumber === orderNumber),
      `got ${adminOrders.orders?.length} orders`);

    const tracked = await fetch(`${BASE}/api/orders/${orderNumber}`);
    const trackedBody = await tracked.json();
    check('anyone can track by order number', tracked.status === 200, `got ${tracked.status}`);
    check('tracking shows the status', trackedBody.order?.status === 'pending');
    check('tracking hides the customer name', !('customerName' in (trackedBody.order ?? {})));
    check('tracking hides the phone', !('customerPhone' in (trackedBody.order ?? {})));
    check('tracking hides the address', !('deliveryAddress' in (trackedBody.order ?? {})));

    const trackUnknown = await fetch(`${BASE}/api/orders/KCH-999999`);
    check('unknown order number 404s', trackUnknown.status === 404, `got ${trackUnknown.status}`);

    const patchUnauth = await fetch(`${BASE}/api/orders/${orderNumber}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status: 'confirmed' }),
    });
    check('status change requires sign-in', patchUnauth.status === 401, `got ${patchUnauth.status}`);

    const orderPatchRes = await fetch(`${BASE}/api/orders/${orderNumber}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ status: 'confirmed' }),
    });
    const patchBody = await orderPatchRes.json();
    check('status change accepted', orderPatchRes.status === 200, `got ${orderPatchRes.status}`);
    check('status is now confirmed', patchBody.order?.status === 'confirmed',
      `got ${patchBody.order?.status}`);

    const badStatus = await fetch(`${BASE}/api/orders/${orderNumber}`, {
      method: 'PATCH',
      headers: jsonHeaders,
      body: JSON.stringify({ status: 'exploded' }),
    });
    check('nonsense status rejected', badStatus.status === 422, `got ${badStatus.status}`);

    const ordersPage = await fetch(`${BASE}/admin/orders`, { headers: authed });
    const ordersHtml = await ordersPage.text();
    check('admin orders page 200', ordersPage.status === 200, `got ${ordersPage.status}`);
    check('orders page shows the order', ordersHtml.includes(orderNumber),
      `looking for ${orderNumber}`);
    check('orders page shows the customer', ordersHtml.includes('Test Customer'));

    const dashPage = await fetch(`${BASE}/admin`, { headers: authed });
    const dashHtml = await dashPage.text();
    check('dashboard counts the order', dashHtml.includes(orderNumber),
      `looking for ${orderNumber}`);

    const trackPage = await fetch(`${BASE}/track`);
    const trackHtml = await trackPage.text();
    check('track page 200', trackPage.status === 200, `got ${trackPage.status}`);
    check('track page has the lookup form', trackHtml.includes('Track Order'));
  } catch (error) {
    failed += 1;
    console.error('\n  CRASHED:', error);
    console.error('\n--- server log (last 3000 chars) ---');
    console.error(serverLog.slice(-3000));
  } finally {
    await stopServer();
  }

  console.log(`\n${passed} passed, ${failed} failed.\n`);
  if (failed > 0) {
    console.error('--- server log (last 3000 chars) ---');
    console.error(serverLog.slice(-3000));
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error(error);
  await stopServer();
  process.exit(1);
});
