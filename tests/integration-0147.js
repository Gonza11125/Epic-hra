// Integrační QA etapy 0.1.4.7 „Living Waters“ v planet-explorer.html (headless Chromium, SwiftShader).
// Scénáře: přistání u jezírka, přepínače Voda/Příroda, kvalita Mobilní/Vysoká, čas Den/Západ/Noc, brodění do jezírka,
// vzlet a návrat na zem, pohled na vodopád. Sleduje: chyby konzole a shaderů, pageerror, selhané požadavky,
// duplicitně načtené moduly (stejný soubor s jiným ?v=), blikání vrstev (příroda/voda v HUD po přistání),
// počty GL draw callů a trojúhelníků na snímek (hook WebGL2, renderer.info není z modulu dostupné).
// Použití: THREE_DIR=/cesta/node_modules/three OUT=/adresar [SCEN=lake,falls,ipad] node tests/integration-0147.js
// Předpoklad: v kořeni repa běží `python3 -m http.server 8765`. Výstup: JSON řádky + souhrn; exit 1 při selhání.
const path = require('path');
const fs = require('fs');
const { chromium, devices } = require('playwright');
const THREE_DIR = process.env.THREE_DIR, OUT = process.env.OUT || '.', BASE = process.env.BASE || 'http://localhost:8765/';
const SCEN = (process.env.SCEN || 'lake,falls,ipad').split(',');
const LAND_MS = +(process.env.LAND_MS || 240000);
// Body z valley-hydrology (viz node: valleyDirection -> coordinates). Planetární východ = +x údolí.
// Jezírko: hladina 50 m, západní břeh x≈558 při z=900; 6 m západně od břehu, chůze na východ do vody.
const LAKE = { lat: 36.029677987650686, lon: 18.0225503774224 };       // (553, 900)
// Vodopád ravine-falls (735, 995), padá na západ; pozorovatel 30 m západně, pohled na východ.
const FALLS = { lat: 36.03280956731464, lon: 18.028749815666398 };                      // ≈ (705, 995)
const results = [];
let failed = 0;
const rec = (scenario, ok, detail) => { if (ok === false) failed++; const r = { scenario, result: ok === null ? 'NEOVĚŘENO' : ok ? 'OK' : 'CHYBA', ...detail }; results.push(r); console.log(JSON.stringify(r)); };

async function open(browser, url, profile) {
  const ctx = await browser.newContext(profile);
  const p = await ctx.newPage();
  if (THREE_DIR) await p.route(/cdn\.jsdelivr\.net\/npm\/three@[^/]+\/(.*)$/, (route) => {
    const rel = route.request().url().replace(/^.*\/npm\/three@[^/]+\//, '').split('?')[0];
    const file = path.join(THREE_DIR, rel);
    if (!fs.existsSync(file)) return route.fulfill({ status: 404, body: 'missing ' + rel });
    route.fulfill({ status: 200, contentType: 'application/javascript', body: fs.readFileSync(file) });
  });
  const st = { errors: [], shader: [], requests: [] };
  p.on('console', (m) => { const t = m.text(); if (/WebGLProgram|Shader Error|WebGLShader/.test(t)) st.shader.push(t.slice(0, 600)); else if (m.type() === 'error') st.errors.push(t.slice(0, 300)); });
  p.on('pageerror', (e) => st.errors.push('pageerror: ' + e.message.slice(0, 300)));
  p.on('requestfailed', (r) => st.errors.push('requestfailed: ' + r.url() + ' ' + r.failure().errorText));
  p.on('response', (r) => { if (r.status() >= 400) st.errors.push('http ' + r.status() + ' ' + r.url()); });
  p.on('request', (r) => st.requests.push(r.url()));
  await p.addInitScript(() => {
    const g = { cur: { calls: 0, tris: 0, points: 0 }, last: null, frames: 0, rendered: 0, hist: [] };
    window.__gl = g;
    for (const C of [window.WebGL2RenderingContext, window.WebGLRenderingContext]) {
      if (!C) continue;
      for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
        const f = C.prototype[name]; if (!f) continue;
        C.prototype[name] = function (...a) {
          const el = name.startsWith('drawElements'), inst = name.endsWith('Instanced') ? a[el ? 4 : 3] : 1, count = el ? a[1] : a[2];
          g.cur.calls++; if (a[0] === 4) g.cur.tris += count / 3 * inst; else if (a[0] === 0) g.cur.points += count * inst;
          return f.apply(this, a);
        };
      }
    }
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => raf((t) => { g.frames++; if (g.cur.calls) { g.last = g.cur; g.rendered++; } g.cur = { calls: 0, tris: 0, points: 0 }; cb(t); });
  });
  await p.goto(BASE + url, { waitUntil: 'load', timeout: 90000 });
  return { p, ctx, st };
}
const hud = (p) => p.evaluate(() => ({ pos: document.getElementById('position')?.textContent, stats: document.getElementById('stats')?.textContent, msg: document.getElementById('message')?.textContent, mode: document.getElementById('mode')?.textContent, overlay: !document.getElementById('landingOverlay')?.hidden, gl: window.__gl.last, frames: window.__gl.frames }));
const num = (re, s) => { const m = (s || '').match(re); return m ? +m[1].replace(/\s| /g, '').replace(',', '.') : null; };
const parse = (h) => ({ lod: num(/LOD (\d+)/, h.stats), nature: num(/příroda (\d+)/, h.stats), water: num(/voda ([\d  ]+) △/, h.stats) || 0, walked: num(/pěšky ([\d ,]+) m/, h.stats) });
const setVal = (p, sel, v) => p.evaluate(([s, v]) => { const e = document.querySelector(s); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); }, [sel, v]);
// 0.1.4.7a: méně používané volby jsou ve sbaleném menu (☰) – před klepnutím ho otevři, pokud je prvek skrytý.
const clickUI = async (p, sel) => { if (!(await p.isVisible(sel)) && (await p.isVisible('#menuToggle'))) await p.click('#menuToggle'); await p.click(sel); };
const shot = async (p, name) => { const f = path.join(OUT, name + '.png'); await p.screenshot({ path: f }); return f; };
async function waitLanded(p, ms = LAND_MS) {
  const t0 = Date.now(); let h;
  while (Date.now() - t0 < ms) { h = await hud(p); if (!h.overlay && /Na povrchu|Přistání dokončeno|Mělká voda|Brodění/.test(h.msg || '')) return { sec: Math.round((Date.now() - t0) / 1000), h }; if (/Terén nemá|nelze spustit/.test((h.msg || '') + (h.pos || ''))) break; await p.waitForTimeout(1000); }
  return { sec: null, h };
}
// Vzorkuje HUD po dobu ms: zjistí poklesy přírody/vody na 0 (blikání brány viditelnosti).
async function watch(p, ms, every = 500) {
  const s = []; const t0 = Date.now();
  while (Date.now() - t0 < ms) { const h = await hud(p); s.push({ t: Date.now() - t0, ...parse(h), overlay: h.overlay }); await p.waitForTimeout(every); }
  return s;
}
function dupModules(requests) {
  const by = new Map();
  for (const u of requests) { if (!u.startsWith(BASE)) continue; const k = new URL(u).pathname; if (!by.has(k)) by.set(k, []); by.get(k).push(new URL(u).search); }
  return [...by].filter(([, v]) => v.length > 1).map(([k, v]) => k + ' ← ' + v.join(' , '));
}
function finish(name, st) {
  rec(name + ': konzole', st.errors.length === 0, { errors: st.errors.slice(0, 10) });
  rec(name + ': shadery', st.shader.length === 0, { shader: st.shader.slice(0, 3) });
  const d = dupModules(st.requests);
  rec(name + ': každý soubor načten jednou', d.length === 0, { duplicates: d });
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const desktop = { viewport: { width: 1280, height: 720 } };
  if (SCEN.includes('lake')) {
    const { p, ctx, st } = await open(browser, `planet-explorer.html?lat=${LAKE.lat}&lon=${LAKE.lon}`, desktop);
    const L = await waitLanded(p);
    const H = parse(L.h);
    rec('přistání u jezírka', L.sec !== null, { seconds: L.sec, msg: L.h.msg, stats: L.h.stats, screenshot: await shot(p, 'lake-01-landed') });
    // Vegetace/voda hned po přistání; blikání během 8 s.
    const w0 = await watch(p, 8000);
    const natZero = w0.filter((s) => !s.nature).length, watZero = w0.filter((s) => !s.water).length;
    rec('po přistání: příroda a voda viditelné, bez blikání', natZero === 0 && watZero === 0, { samples: w0.length, natureZero: natZero, waterZero: watZero, first: w0[0], last: w0.at(-1) });
    await setVal(p, '#pitch', 12); await p.waitForTimeout(4000);
    const base = await shot(p, 'lake-02-view-mobile');
    const glMobile = (await hud(p)).gl; const wm = parse(await hud(p));
    // Voda vyp/zap
    await clickUI(p, '#water'); await p.waitForTimeout(4000); const offH = await hud(p); const off = await shot(p, 'lake-03-water-off');
    await clickUI(p, '#water'); await p.waitForTimeout(4000); const onH = await hud(p); const on = await shot(p, 'lake-04-water-on');
    rec('přepínač Voda vyp/zap', !/voda \d/.test(offH.stats) && /voda \d/.test(onH.stats), { off: offH.stats, on: onH.stats, glOff: offH.gl, glOn: onH.gl, screenshots: [off, on] });
    // Příroda vyp/zap
    await clickUI(p, '#nature'); await p.waitForTimeout(4000); const nOff = await hud(p); const nOffS = await shot(p, 'lake-05-nature-off');
    await clickUI(p, '#nature'); await p.waitForTimeout(5000); const nOn = await hud(p); const nOnS = await shot(p, 'lake-06-nature-on');
    rec('přepínač Příroda vyp/zap', parse(nOff).nature === 0 && parse(nOn).nature > 0, { off: nOff.stats, on: nOn.stats, glOff: nOff.gl, glOn: nOn.gl, screenshots: [nOffS, nOnS] });
    // Kvalita Vysoká
    await setVal(p, '#quality', 'high'); await p.waitForTimeout(12000); const hi = await hud(p); const hiS = await shot(p, 'lake-07-quality-high');
    const wHigh = parse(hi);
    rec('kvalita Vysoká', wHigh.water > wm.water, { mobile: { stats: L.h.stats, gl: glMobile, water: wm.water }, high: { stats: hi.stats, gl: hi.gl, water: wHigh.water }, screenshot: hiS });
    await setVal(p, '#quality', 'mobile'); await p.waitForTimeout(8000); const mo = await hud(p);
    rec('kvalita zpět Mobilní', parse(mo).water === wm.water, { stats: mo.stats, gl: mo.gl, screenshot: await shot(p, 'lake-08-quality-mobile') });
    // Denní doby (obě kvality pro shader vody)
    for (const q of ['mobile', 'high']) {
      await setVal(p, '#quality', q);
      for (const d of ['day', 'sunset', 'night']) { await setVal(p, '#daylight', d); await p.waitForTimeout(5000); const h = await hud(p); rec(`čas ${d} (${q})`, /voda \d/.test(h.stats), { stats: h.stats, screenshot: await shot(p, `lake-09-${q}-${d}`) }); }
    }
    await setVal(p, '#quality', 'mobile'); await setVal(p, '#daylight', 'day'); await p.waitForTimeout(3000);
    // Brodění: chůze na východ do jezírka. Očekávání: Mělká voda -> Brodění (poloviční rychlost) -> stop u 1,1 m.
    const log = []; await p.keyboard.down('w'); const t0 = Date.now(); let stuck = 0, prevW = null;
    while (Date.now() - t0 < 150000) {
      await p.waitForTimeout(1000); const h = await hud(p), s = parse(h); const depth = num(/voda ([\d,]+) m/, h.msg);
      log.push({ t: Math.round((Date.now() - t0) / 1000), walked: s.walked, depth, msg: (h.msg || '').slice(0, 90), pos: h.pos?.split(' · ')[0] });
      if (prevW !== null && s.walked === prevW) stuck++; else stuck = 0; prevW = s.walked;
      if (stuck >= 8) break;
    }
    await p.keyboard.up('w');
    const wadeShot = await shot(p, 'lake-10-wading-stop');
    const sawShallow = log.some((l) => /Mělká voda/.test(l.msg)), sawWade = log.some((l) => /Brodění/.test(l.msg)), sawDeep = log.some((l) => /Hluboká voda/.test(l.msg));
    const maxDepth = Math.max(0, ...log.map((l) => l.depth || 0));
    // rychlost: m/s v suchu vs při brodění
    const rate = (f) => { const seg = log.filter(f); if (seg.length < 3) return null; return (seg.at(-1).walked - seg[0].walked) / (seg.at(-1).t - seg[0].t); };
    const dry = rate((l) => /Na povrchu/.test(l.msg)), wade = rate((l) => /Brodění/.test(l.msg));
    rec('brodění: mělká voda, zpomalení, stop nad 1,1 m, nepropadne', sawShallow && sawWade && stuck >= 8 && maxDepth <= 1.25, { sawShallow, sawWade, sawDeepMsg: sawDeep, stoppedAt: log.at(-1), maxDepthSeen: maxDepth, rateDry: dry, rateWade: wade, screenshot: wadeShot, log: log.filter((_, i) => i % 3 === 0 || i === log.length - 1) });
    // Pokus pokračovat do hloubky: drží W dalších 10 s, poloha se nesmí změnit; pak couvnout (S) musí jít.
    const before = parse(await hud(p)).walked; await p.keyboard.down('w'); await p.waitForTimeout(10000); await p.keyboard.up('w'); const after = parse(await hud(p)).walked;
    await p.keyboard.down('s'); await p.waitForTimeout(8000); await p.keyboard.up('s'); const back = parse(await hud(p)).walked;
    rec('hluboká voda drží, ústup možný', after - before < 0.3 && back > after, { before, after, back });
    // Vzlet a let nízko nad jezírkem (voda nad hrubým terénem?)
    await p.click('#mode'); await p.waitForTimeout(1500);
    const fly = [];
    for (let i = 0; i < 12; i++) { const h = await hud(p); fly.push({ t: i * 2, ...parse(h), msg: (h.msg || '').slice(0, 60) }); if (i === 1 || i === 6 || i === 11) await shot(p, `lake-11-fly-${i}`); await p.waitForTimeout(2000); }
    // nízký let 1,5 km
    await setVal(p, '#alt', 384); // 1,5 km (0.1.4.7a: stupnice 0–500 = 0,15–3 km) await setVal(p, '#pitch', 35);
    const low = []; for (let i = 0; i < 20; i++) { const h = await hud(p); low.push({ t: i * 2, ...parse(h) }); if (i % 5 === 0) await shot(p, `lake-12-low-${i}`); await p.waitForTimeout(2000); }
    rec('vzlet (let)', /Přistát/.test((await hud(p)).mode), { fly: fly.filter((_, i) => i % 3 === 0), low: low.filter((_, i) => i % 4 === 0), gl: (await hud(p)).gl });
    // Návrat na zem
    await p.click('#mode'); const L2 = await waitLanded(p);
    const w2 = await watch(p, 6000);
    rec('návrat na zem', L2.sec !== null && w2.every((s) => s.nature > 0 && s.water > 0), { seconds: L2.sec, stats: L2.h.stats, natureZero: w2.filter((s) => !s.nature).length, waterZero: w2.filter((s) => !s.water).length, screenshot: await shot(p, 'lake-13-relanded') });
    finish('lake', st); await ctx.close();
  }
  if (SCEN.includes('falls')) {
    const { p, ctx, st } = await open(browser, `planet-explorer.html?lat=${FALLS.lat}&lon=${FALLS.lon}`, desktop);
    const L = await waitLanded(p);
    rec('přistání u vodopádu', L.sec !== null, { seconds: L.sec, stats: L.h.stats, msg: L.h.msg });
    await setVal(p, '#pitch', -8); await p.waitForTimeout(4000);
    const a = await shot(p, 'falls-01-mobile'); const gm = (await hud(p)).gl;
    await setVal(p, '#quality', 'high'); await p.waitForTimeout(12000);
    const b = await shot(p, 'falls-02-high'); const hh = await hud(p);
    await p.click('#view'); await p.waitForTimeout(3000); const c = await shot(p, 'falls-03-high-1st');
    await setVal(p, '#daylight', 'sunset'); await p.waitForTimeout(4000); const d = await shot(p, 'falls-04-high-sunset');
    rec('vodopád (render)', /voda \d/.test(hh.stats), { glMobile: gm, glHigh: hh.gl, stats: hh.stats, screenshots: [a, b, c, d] });
    finish('falls', st); await ctx.close();
  }
  if (SCEN.includes('ipad')) {
    const prof = { ...devices['iPad Pro 11'], viewport: { width: 1194, height: 834 } };
    const { p, ctx, st } = await open(browser, `planet-explorer.html?lat=${LAKE.lat}&lon=${LAKE.lon}`, prof);
    const mid = []; for (let i = 0; i < 3; i++) { await p.waitForTimeout(4000); mid.push(await shot(p, 'ipad-landing-' + i)); }
    const L = await waitLanded(p);
    await setVal(p, '#pitch', 12); await p.waitForTimeout(4000);
    rec('iPad 1194×834: přistání u jezírka', L.sec !== null, { seconds: L.sec, stats: (await hud(p)).stats, screenshots: [...mid, await shot(p, 'ipad-landed')] });
    finish('ipad', st); await ctx.close();
  }
  await browser.close();
  console.log('SOUHRN', JSON.stringify({ ok: results.filter((r) => r.result === 'OK').length, fail: failed }));
  process.exitCode = failed ? 1 : 0;
})();
