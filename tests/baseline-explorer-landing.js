// Sonda přistání v planet-explorer.html: každých INTERVAL ms zapíše HUD (sektory, LOD, načítání,
// příroda, hlášení), počet snímků a uloží screenshot. Ověřuje, zda přistání doběhne do TOTAL ms.
// Použití: THREE_DIR=... OUT=/adresar TOTAL=120000 INTERVAL=10000 node tests/baseline-explorer-landing.js [stranka] [w] [h]
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const [,, page = 'planet-explorer.html', w = '1280', h = '720'] = process.argv;
const THREE_DIR = process.env.THREE_DIR, OUT = process.env.OUT || '.';
const TOTAL = +(process.env.TOTAL || 120000), INTERVAL = +(process.env.INTERVAL || 10000);
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await browser.newPage({ viewport: { width: +w, height: +h } });
  if (THREE_DIR) await p.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, (route) => {
    const rel = route.request().url().replace(/^.*\/npm\/three@[^/]+\//, '').split('?')[0];
    const file = path.join(THREE_DIR, rel);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'missing ' + rel });
    route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(file) });
  });
  const errors = [];
  p.on('console', (m) => { if (m.type() === 'error' || /WebGLProgram/.test(m.text())) errors.push(m.text().slice(0, 300)); });
  p.on('pageerror', (e) => errors.push('pageerror: ' + e.message.slice(0, 300)));
  await p.addInitScript(() => { window.__frames = 0; const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { window.__frames++; cb(t); }); });
  await p.goto('http://localhost:8765/' + page, { waitUntil: 'load', timeout: 90000 });
  const t0 = Date.now();
  let landed = null;
  while (Date.now() - t0 < TOTAL) {
    await p.waitForTimeout(INTERVAL);
    const s = await p.evaluate(() => ({ f: window.__frames, stats: document.getElementById('stats')?.textContent, msg: document.getElementById('message')?.textContent, mode: document.getElementById('mode')?.textContent }));
    const sec = Math.round((Date.now() - t0) / 1000);
    console.log(`${sec}s frames=${s.f} | ${s.stats} | ${s.msg} | mode=${s.mode}`);
    await p.screenshot({ path: path.join(OUT, `explorer-${w}x${h}-${sec}s.png`) });
    if (!landed && /Na povrchu|Přistání dokončeno/.test(s.msg || '')) { landed = sec; }
  }
  console.log('přistání dokončeno:', landed ? landed + ' s' : 'NE do ' + TOTAL / 1000 + ' s');
  console.log(errors.length ? errors.join('\n') : 'Žádné chyby v konzoli.');
  await browser.close();
})();
