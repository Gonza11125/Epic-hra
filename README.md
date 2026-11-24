# NEXUS — One world. Infinite futures.

## 0.1.2 — Světlo na horizontu / Visual Overhaul
- Samostatný grafický modul `visuals.js`: procedurální obloha se sluncem, oblaky a hvězdami, měnící se nasvícení, plynulá mlha a dvě vrstvy horského panoramatu.
- Členité jehličnany, keře, kameny, animovaný pohyb trávy; detailnější materiály, reliéf štěrku a střech.
- Sedlová střecha nádraží, průhledná okna, přístřešek, výbava, železniční detaily a signály.
- Anomálie se svítícím halem, orbitujícími úlomky, částicemi a zvukem; déšť jako stopy, zvuky kroků.
- Nové menu a HUD, tři grafické profily (Úsporná / Vyvážená / Vysoká se stíny). Volba grafiky uložena lokálně.
- Původní mise a záznamy zachovány, stejný klíč uloženého postupu.
- JavaScript prošel syntaktickou kontrolou. Vizuální výsledek, kompilaci shaderů v GPU a výkon je nutné otestovat v prohlížeči a na fyzickém iPadu.

## 0.1.1 — Ozvěny údolí
- Procedurální povrchové textury, tráva, nové orientační body a osvětlení nádraží.
- Cyklus počasí: jasno, mlha a déšť; ambientní zvuk větru a potvrzení interakcí.
- Mapa oblasti (M nebo tlačítko MAPA), čtyři volitelné záznamy a expediční deník.
- Kompatibilita se save 0.1.0; multiplayer zatím není dostupný.
- Kontrola syntaxe JavaScriptu prošla; test v Safari na zařízení zbývá.

## 0.1.0 — Probuzení
Webový 3D prototyp první expedice, Three.js r160 / WebGL. Bez sestavování. Otevři GitHub Pages nebo spusť statický HTTP server v kořeni projektu. První načtení vyžaduje internet pro CDN.

## Ovládání
- PC: WASD/šipky, myš, E interakce, Shift běh, mezerník skok, F světlo, Esc pauza.
- iPad/mobil: joystick vlevo, tažení po scéně pro kameru, tlačítka vpravo. Doporučena orientace na šířku.
- Uložení: localStorage na konkrétním zařízení; nová hra přepisuje postup po potvrzení.

## Publikování
Settings → Pages → Deploy from a branch → main → /(root) → Save. Očekávaná adresa: https://gonza11125.github.io/Epic-hra/ (po úspěšném nasazení).

## Roadmap
0.1.x: průzkum, ovládání, prostředí, interakce a optimalizace. 0.2: živé město. 0.3: ekonomika. 0.4: vlak a cestování. 0.5: stavění a výroba. 0.6: vztahy a NPC. 0.7: anomálie a věda. 0.8: civilizace. 0.9: propojení a optimalizace. 1.0: ucelená hra. 2.0: kooperace a crossplay. Jedná se o cíle, nikoli již hotové funkce.

## Stav testování
První vývojový prototyp; fyzická zařízení a kompatibilitu Safari je nutné ověřit. V dalších verzích oddělit simulaci, vstup, renderer a ukládání do samostatných modulů a zavést verzování uložených dat. Multiplayer není zatím implementován.
