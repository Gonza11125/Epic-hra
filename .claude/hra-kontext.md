# NEXUS — společný kontext pro agenty

Všichni agenti si tento soubor přečtou jako první.

## Co je NEXUS
Originální hra „NEXUS — Infinite Civilizations“: planeta Elyra (poloměr 1 737,4 km), plynulý přechod z vesmíru na povrch, chůze po kouli s radiální gravitací, biomy, mimozemská příroda, osady, doprava (vlaky, stanice, jízdní řády). Webový prototyp v Three.js, budoucí nativní verze v Unreal Engine.

## Hlavní dokument: `docs/NEXUS_Master_Plan.md`
Master Plan 1.0 (24. 11. 2026) je vývojová bible: vize, 18 kapitol a roadmapa G01–G100 s kritérii dokončení. Před každým větším úkolem si přečti příslušnou kapitolu a uveď, kterou etapu (G-ID nebo verzi 0.1.4.x) práce posouvá. Části označené [návrh] nejsou hotové funkce.

### Rozhodnutí uživatele (z konverzace k 27. 11. 2026)
- **Nekomerční osobní projekt** – „vysněný toulavý svět“, nebude se prodávat. **Jen bezplatné nástroje a assety** (Blender, Unreal Engine, Poly Haven, ambientCG – CC0, Fab s filtrem Free, Gaea Community, Mixamo). Nenavrhuj placené služby ani předplatné.
- **Hardware uživatele**: PC s RTX 5060 (8 GB VRAM), 32 nebo 64 GB RAM; dále iPad (Safari). Lokální AI pro 3D: Hunyuan3D 2.0 WinPortable (CUDA 12.9, profil Low VRAM) – instalace rozpracovaná. TRELLIS/TRELLIS.2 vyžadují víc VRAM.
- **Tripo AI vyřazeno** (export není zdarma, špatná kvalita). Vlaky, lodě a budovy se dělají **parametricky** v NEXUS Model Studiu; generativní AI jen pro skály, rostliny a zvířata.
- **Model Studio – plán**: 01 Rail Workshop (hotovo, Panorama 78 dle předlohy uživatele), 02 Nature Studio, 03 Architecture Studio, 04 Spaceship Studio.
- **Cíl**: realistické (ne kreslené) sci-fi, filmové světlo; hlavní cíl nativní Unreal Engine 5 pro PC, později iPad. Web zůstává prototypem a nástrojem.
- **Priorita teď**: dokončit **Údolí 07** jako první hratelnou ukázku (vertical slice, kap. 4.4). Další etapa **0.1.4.7 Living Waters** – nejdřív hydrologie podle terénu (jezírko, přítok, odtok, vodopád), potom shader vody; cesty nesmí být zablokované. Pak 0.1.4.8 osada na plošině 240 × 240 m, 0.1.4.9 detaily. Nepřidávat další planety, dokud není ověřený pohyb a lokální svět.
- **Známý hlavní nesoulad**: původní hra (194 × 194 m, 24h den, vlastní save) vs. planetární explorer (27h den) – cílem je jeden svět, ne dva.
- **Jména, která zachovat**: domy AURA H-01 … ZENITH H-08, FORUM C-01, ASTER MARKET, HELIX Institute, VITA Centre, TRANSIT 07, Luma Gardens, loď A-17, vlak LUMEN R24, 9 druhů flóry (Aurora, Spire, Veil, …).

## Technologie
- Čistý JavaScript (ES moduly), bez bundleru a bez npm. Three.js **0.160.0** z `cdn.jsdelivr.net/npm/three@0.160.0/` přes import mapy v HTML.
- Nasazení: GitHub Pages (`https://gonza11125.github.io/Epic-hra/...`). Cílová zařízení: desktop a **iPad** (dotykové ovládání, mobilní režim kvality).
- Stránky: `index.html` (hra), `planet-explorer.html`, `planet-atlas.html`, `model-studio.html`, `architecture-studio.html`, `transport-lab.html`, `vector-review.html`.
- Klíčové moduly: `elyra-geography.js` (svět, výšky, biomy), `planet-streaming.js` (LOD dlaždice), `planet-physics.js` (chůze, gravitace), `terrain-materials.js` (triplanární materiály), `planet-atmosphere.js` (obloha, den/noc, mraky), `valley-nature.js` + `valley-flora.js` (instancovaná vegetace), `visuals.js`, `model-studio-train.js`, `transitVehicles.js`, `regionalTrain.js`.

## Společná pravidla
1. **Poctivost jako v README.** Každá změna rozlišuje, co bylo ověřeno (syntaxe, numerické testy, skutečný render v Chromiu, screenshot) a co ne (iPad, Safari, výkon na GPU, Pages). Nikdy netvrď FPS, „fotorealistický“ nebo „funguje na iPadu“, pokud to nebylo změřeno.
2. **Deterministické generování.** Svět je generovaný ze seedů; souřadnice osad, pobřeží a biomů se nesmí nechtěně posunout. Změny ověř porovnáním před/po.
3. **Plovoucí počátek a měřítko.** Planeta má skutečné měřítko v metrech; scéna se vykresluje relativně ke kameře, používá se logaritmický depth buffer. Nepřidávej absolutní souřadnice do GPU bez lokálního počátku.
4. **Rozpočet výkonu.** Mobilní režim musí zůstat lehký: instancing, sdílené materiály, LOD, žádné nové dynamické stíny bez přepínače kvality. Každá nová vizuální funkce dostane přepínač kvality (nízká / vysoká).
5. **Originální obsah.** Žádné kopie postav, map, modelů, hudby ani vzhledu existujících her. Inspirace žánrem ano, napodobení konkrétní hry ne. Externí assety jen s licencí CC0/CC-BY a se zápisem zdroje.
6. **Bez rozbití starých stránek.** Původní mapy a modely ve hře zůstávají funkční; nové věci zapínej přes volbu nebo samostatnou stránku, dokud nejsou ověřené.
7. **Ověření v prohlížeči.** V kontejneru je Chromium + Playwright (`require('playwright')`, `chromium.launch()`). Stránky spouštěj přes `python3 -m http.server` a dělej screenshoty; Three.js z CDN může být za proxy nedostupné – pak to napiš, nepředstírej render.
8. **Jazyk.** Komunikace a README česky; identifikátory v kódu anglicky jako dosud.
9. **README.** Každá dokončená etapa dostane záznam na začátek `README.md` ve stávajícím stylu (verze, co přibylo, kolik kontrol, co neověřeno, další etapa).
