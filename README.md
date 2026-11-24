# NEXUS — Infinite Civilizations

Infinite worlds. One life. Your choice.

## 0.1.3.2 — Živá Elyra
- `flora5000.js`: původní procedurální 3D modely tří stromů (Aurora, Veil, Spire), exotických hub a korálového podrostu. Nové stromy nahrazují původní les v Údolí 07 při zachování původního rozmístění a kolizí.
- Bioluminiscenční části rostlin zesilují v noci a jemně pulzují; upravené barvy půdy a trávy.
- Tři skutečné exempláře stromů lze prozkoumat tlačítkem POUŽÍT. Zelené body na mapě označují botanická místa. Jde o informační interakce, nikoli sběr rostlin.
- Geometrie je vykreslována pomocí sdílených instancí, stíny kmenů pouze ve vysokém profilu. Haven a uložené pozice zůstávají beze změn.
- Syntaxe nového modulu a hlavního skriptu zkontrolována. Vizuální výsledek a výkon na iPadu zatím neověřeny.

## 0.1.3.1 — Rok 5000: první sada modelů
- `assets5000.js`: samostatné továrny na originální procedurální 3D modely (kurýrní loď A-17, servisní dron, kvantový vysílač, občanský terminál, vstupní brána a rostlina Luma). Sdílené materiály, zaoblené a extrudované tvary, světelné detaily.
- První sada je osazena v původním Údolí 07. Loď se vznáší nad označenou plošinou, dron létá po trase a terminál zobrazuje animovaný hologram. Tři technologická zařízení lze prozkoumat tlačítkem POUŽÍT (E na PC); jejich polohy jsou na mapě.
- Nové kolize respektují původní úkoly; pokud stará uložená pozice zasáhne novou překážku, hra vyhledá blízkou volnou pozici. Haven zůstává beze změn. Loď zatím nelze řídit.
- Příběhové zasazení do roku 5000. Nové modely jsou první iterace, nikoli finální realistické assety.
- Kontrola syntaxe obou upravených souborů prošla; skutečný vizuální test v Safari a výkon na iPadu dosud neověřeny.

## 0.1.3 — Nový začátek
- Galaxie Aurelia, soustava Solaris, planeta Elyra, měsíc Nyx, planeta Vesta a stanice Orion. Atlas je informační katalog; lety do vesmíru zatím nejsou implementovány.
- Dva skutečně průchozí regiony Elyry: Údolí 07 a Haven. Haven nabízí jezero, lesy, výzkumný přístřešek, solární panely a tři volitelné průzkumné body.
- Tlačítko VESMÍR nebo klávesa V otevře atlas a umožní okamžitý regionální přesun. Poslední pozice v každém regionu a objevy se ukládají.
- `universe.js`: hierarchie, identifikátory, model hráče, verzované ukládání, migrace a cestování; `regions.js`: samostatný obsah regionu Haven a nebeská tělesa. `visuals.js` zůstává sdílený grafický modul.
- Staré mise jsou zachovány a volitelné. Uložené hry 0.1.0–0.1.2 se načítají ze starého klíče při prvním spuštění; nový klíč je `nexus-world-v3`.
- Testy migrace, přesunů, návratu na poslední pozici a ukládání prošly; syntaxe JS zkontrolována. Vizuální a herní test na skutečném iPadu dosud neproveden.

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
0.1: základy postavy, regionů a inventáře. 0.2: živá města a NPC. 0.3: ekonomika, bydlení a stavění. 0.4: lodě a vesmírné lety. 0.5: nové planety a kolonizace. 0.6: politika a civilizace. 0.7: konflikty a bezpečnost. 0.8: mezihvězdný obchod a cestování. 0.9: další galaxie a simulace. 1.0: ucelená hra, následně kooperace a crossplay. Jedná se o cíle, nikoli již hotové funkce.

## Stav testování
První vývojový prototyp; fyzická zařízení a kompatibilitu Safari je nutné ověřit. V dalších verzích dále oddělit simulaci, vstup a renderer; verzování uložených dat je zavedeno v 0.1.3. Multiplayer není zatím implementován.
