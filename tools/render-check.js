// Vykreslí stránku NEXUS v headless Chromiu a uloží screenshot + chyby konzole.
// Three.js z CDN se obsluhuje z lokální kopie (pro prostředí bez přístupu na jsDelivr).
// Použití: THREE_DIR=/cesta/node_modules/three node tools/render-check.js <stranka.html?parametry> <out.png> [cekani_ms] [sirka] [vyska]
// Předpoklad: v kořeni repa běží `python3 -m http.server 8765`.
// Volitelně ACTIONS='[...]' (JSON) – kroky po načtení stránky, před čekáním na snímek:
//   {"wait":ms} | {"click":"#id"} | {"value":["#id","hodnota"]} (nastaví input/select a vyvolá input+change)
//   {"key":"a","ms":400} (podrží klávesu) | {"until":"regex","ms":120000} (čeká, až text #message/#stats odpovídá)
// Po snímku vypíše obsah HUD (#position, #stats, #message).
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const [,, page = 'planet-explorer.html', out = 'render.png', waitMs = '15000', w = '1280', h = '720'] = process.argv;
const THREE_DIR = process.env.THREE_DIR;
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await browser.newPage({ viewport: { width: +w, height: +h } });
  if (THREE_DIR) {
    await p.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, (route) => {
      const rel = route.request().url().replace(/^.*\/npm\/three@[^/]+\//, '').split('?')[0];
      const file = path.join(THREE_DIR, rel);
      if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'missing ' + rel });
      route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(file) });
    });
  }
  const log = [];
  p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) log.push(`${m.type()}: ${m.text().slice(0, 300)}`); });
  p.on('pageerror', (e) => log.push('pageerror: ' + e.message.slice(0, 300)));
  p.on('requestfailed', (r) => log.push('requestfailed: ' + r.url() + ' ' + r.failure().errorText));
  await p.goto('http://localhost:8765/' + page, { waitUntil: 'load', timeout: 60000 });
  for (const step of JSON.parse(process.env.ACTIONS || '[]')) {
    if (step.wait) await p.waitForTimeout(step.wait);
    if (step.click) { if (!(await p.isVisible(step.click)) && (await p.isVisible('#menuToggle'))) await p.click('#menuToggle'); await p.click(step.click); } // skryté volby jsou ve sbaleném menu (0.1.4.7a)
    if (step.value) await p.evaluate(([sel, v]) => { const e = document.querySelector(sel); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, step.value);
    if (step.key) { await p.keyboard.down(step.key); await p.waitForTimeout(step.ms || 300); await p.keyboard.up(step.key); }
    if (step.until) { const re = new RegExp(step.until), t0 = Date.now(); while (Date.now() - t0 < (step.ms || 120000)) { const txt = await p.evaluate(() => (document.getElementById('message')?.textContent || '') + ' | ' + (document.getElementById('stats')?.textContent || '')); if (re.test(txt)) break; await p.waitForTimeout(1000); } }
  }
  await p.waitForTimeout(+waitMs);
  await p.screenshot({ path: out });
  console.log('HUD:', await p.evaluate(() => ['position', 'stats', 'message'].map((id) => document.getElementById(id)?.textContent || '').join(' | ')).catch(() => '-'));
  console.log(log.length ? log.join('\n') : 'Žádné chyby v konzoli.');
  await browser.close();
})();
