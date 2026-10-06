/** Dumps what /admin/products/[id] actually renders for a bogus id. */
import './env';
import { spawn, execSync } from 'node:child_process';

const PORT = 3211;
const BASE = `http://localhost:${PORT}`;

async function freePort(): Promise<void> {
  if (process.platform !== 'win32') return;
  try {
    const out = execSync(
      `powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort ${PORT} -State Listen -ErrorAction SilentlyContinue).OwningProcess"`,
      { encoding: 'utf8' }
    ).trim();
    for (const pid of out.split(/\s+/).filter(Boolean)) {
      if (/^\d+$/.test(pid)) {
        try { execSync(`taskkill /pid ${pid} /T /F`, { stdio: 'ignore' }); } catch {}
      }
    }
    if (out) await new Promise((r) => setTimeout(r, 2000));
  } catch {}
}

async function main() {
  await freePort();
  const server = spawn(`npx next dev -p ${PORT}`, { shell: true, stdio: ['ignore', 'pipe', 'pipe'] });
  let log = '';
  server.stdout?.on('data', (d) => (log += d));
  server.stderr?.on('data', (d) => (log += d));

  try {
    const deadline = Date.now() + 60000;
    for (;;) {
      if (Date.now() > deadline) throw new Error('server did not start');
      try { if ((await fetch(BASE + '/')).ok) break; } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }

    const login = await fetch(`${BASE}/api/admin/auth`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ pin: process.env.ADMIN_PIN || '1990' }),
    });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];

    for (const path of ['/admin/products/new', '/admin/products/00000000-0000-0000-0000-000000000000']) {
      const res = await fetch(BASE + path, { headers: { cookie } });
      const html = await res.text();
      console.log(`\n=== ${path}  →  ${res.status}  (${html.length} bytes) ===`);
      const markers: [string, boolean][] = [
        ['"Edit Product" heading', html.includes('Edit Product')],
        ['"Add Product" heading', html.includes('Add Product')],
        ['helper text "jaise 4500"', html.includes('jaise 4500')],
        ['step section "Basic Info"', html.includes('Basic Info')],
        ['back button "Wapas list pe"', html.includes('Wapas list pe')],
        ['error boundary "Kuch theek nahi chal raha"', html.includes('Kuch theek nahi chal raha')],
        ['login form "Sign In"', html.includes('Sign In')],
        ['admin nav "Kamran Cloth House — Admin"', html.includes('Kamran Cloth House — Admin')],
        ['input value= attr', /value="/.test(html)],
      ];
      for (const [label, found] of markers) console.log(`   ${found ? 'YES' : ' no '}  ${label}`);

      const bi = html.indexOf('<body');
      console.log('   --- first 600 chars of <body> ---');
      console.log(bi >= 0 ? html.slice(bi, bi + 600) : html.slice(0, 600));
      console.log('   --- server log tail ---');
      console.log(log.slice(-2500));
    }
  } catch (e) {
    console.error(e);
    console.error(log.slice(-2000));
  } finally {
    if (server.pid) { try { execSync(`taskkill /pid ${server.pid} /T /F`, { stdio: 'ignore' }); } catch {} }
  }
}

main();
