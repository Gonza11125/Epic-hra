// Baseline audit stránek NEXUS: chyby konzole, pageerror, selhané požadavky, HTTP >= 400,
// chyby kompilace shaderů a screenshoty pro desktop 1280x720 a iPad Pro 11 (na šířku 1194x834).
// Použití: THREE_DIR=/cesta/node_modules/three OUT=/adresar WAIT=15000 node tests/baseline-pages.js [stranka ...]
// Předpoklad: v kořeni repa běží `python3 -m http.server 8765`.
const path = require('path');
const fs = require('fs');
const { chromium, devices } = require('playwright');
const THREE_DIR = process.env.THREE_DIR;
const OUT = process.env.OUT || '.';
const WAIT = +(process.env.WAIT || 15000);
const BASE = process.env.BASE || 'http://localhost:8765/';
const PAGES = process.argv.slice(2).length ? process.argv.slice(2) : [
  'index.html', 'planet-explorer.html', 'planet-atlas.html', 'model-studio.html?design=reference',
  'architecture-studio.html', 'transport-lab.html', 'vector-review.html'];
const ipad = devices['iPad Pro 11'];
const PROFILES = {
  desktop: { viewport: { width: 1280, height: 720 } },
  ipad: { ...ipad, viewport: { width: 1194, height: 834 } },
};
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let failed = 0;
  for (const pg of PAGES) for (const [name, prof] of Object.entries(PROFILES)) {
    const ctx = await browser.newContext(prof);
    const p = await ctx.newPage();
    if (THREE_DIR) await p.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, (route) => {
      const rel = route.request().url().replace(/^.*\/npm\/three@[^/]+\//, '').split('?')[0];
      const file = path.join(THREE_DIR, rel);
      if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'missing ' + rel });
      route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(file) });
    });
    const errors = [], warnings = [];
    p.on('console', (m) => {
      const t = m.text().slice(0, 400);
      if (m.type() === 'error' || /WebGLProgram|Shader Error|THREE\.WebGLShader/.test(t)) errors.push('console: ' + t);
      else if (m.type() === 'warning') warnings.push(t);
    });
    p.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 400)));
    p.on('requestfailed', (r) => errors.push('requestfailed: ' + r.url() + ' ' + r.failure().errorText));
    p.on('response', (r) => { if (r.status() >= 400) errors.push('http ' + r.status() + ': ' + r.url()); });
    const t0 = Date.now();
    try {
      await p.goto(BASE + pg, { waitUntil: 'load', timeout: 90000 });
      await p.waitForTimeout(WAIT);
    } catch (e) { errors.push('goto: ' + e.message.slice(0, 200)); }
    const file = path.join(OUT, pg.replace(/[^a-z0-9]+/gi, '_') + '-' + name + '.png');
    try { await p.screenshot({ path: file }); } catch (e) { errors.push('screenshot: ' + e.message.slice(0, 200)); }
    const canvas = await p.evaluate(() => { const c = document.querySelector('canvas'); return c ? c.width + 'x' + c.height : 'bez canvasu'; }).catch(() => '?');
    if (errors.length) failed++;
    console.log(JSON.stringify({ page: pg, profile: name, ms: Date.now() - t0, canvas, screenshot: file, errors, warnings: warnings.slice(0, 8) }));
    await ctx.close();
  }
  await browser.close();
  process.exitCode = failed ? 1 : 0;
})();
