# NEXUS — Infinite Civilizations

Infinite worlds. One life. Your choice.

## 0.1.3.6.3 — LUMEN R24
- `regionalTrain.js`: nový regionální maglev délky 24 m, dva průchozí články, 16 samostatně modelovaných sedadel, prosklené stěny, skutečné dveřní otvory, madla, zavazadlové police, palubní displeje, levitační moduly a rozdílná barevnost M1/M2.
- Stejná geometrie interiéru a exteriéru je používána ve stanici i během cesty. Nástup a výstup probíhají chůzí přes správný dveřní otvor na straně nástupiště, bez automatického výstupu. Stání, chůze a dobrovolné sezení; E/POUŽÍT nebo palubní tlačítko pro sednutí a vstávání. Poloha a sedadlo se ukládají.
- Při místním příjezdu, stání a odjezdu se z kabiny vykresluje skutečný region se stanicí. Mezi regiony je zatím využita vizuální simulace krajiny. Nova Aster není otevřená pro výstup.
- Zkrácená nástupiště (29 m), zvýšená na úroveň podlahy vozidla. Oba směry a původní jízdní řády zachovány.
- Design Lab aktualizován o nový model a pohled z interiéru. 96 dílčích kontrol průchodnosti, dveřních pravidel, jízdního stavu a migrace uložení prošlo; syntaktická kontrola prošla. Skutečný grafický a herní test na iPadu zatím nebyl proveden.

## 0.1.3.6.2 — Kolosy Elyry
- Dva fyzicky oddělené hladké magnetické koridory v Údolí 07 i Haven, s protisměrnými linkami M1 a M2 a samostatnými jízdními řády. Obě linky přepravují hráče mezi dostupnými regiony. M2 má v Údolí nástupiště 02, A2 přesunuto na 03. Ve vzdálených úsecích zůstává krajina simulována.
- `monuments5000.js`: dvě monumentální brány vysoké přibližně 32 m, vzdálená silueta devíti věží o výšce 72–124 m, energetický prstenec a větší nebeská tělesa. Věže za hranicí mapy jsou vizuální kulisa, nikoliv zpřístupněné město.
- `player5000.js`: první samostatný 3D model hráče v expedičním obleku, animace končetin při chůzi a běhu, kamera třetí osoby s přiblížením při překážce. C na PC nebo tlačítko 1. OS./3. OS. na dotykovém zařízení; preference se ukládá. Kabina vlaku zatím používá první osobu.
- 6 kontrol protisměrného jízdního řádu a 4 kontroly M2 nastupování, ukládání a výstupu prošly. Syntaxe upravených modulů ověřena; skutečné vykreslení, kolize a výkon na iPadu dosud neověřeny. Kulatá planeta zůstává plánovaným milníkem.

## 0.1.3.6.1 — Dopravní design 5000
- M1 Aurora Maglev: tři propojené články, nominální délka 38,4 m, aerodynamická čela, panoramatické pásy oken, dvojité posuvné dveřní panely a levitační moduly. Bílý, sytě tyrkysový, modrý a fialový lak.
- A2 Solaris Cityliner: nominální délka 10,8 m, široké prosklené čelo, výrazné oranžové a modré prvky, dveře a čtyři levitační moduly.
- Klasické koleje, pražce, troleje a staré signály odstraněny z Údolí 07, Haven i simulovaného okolí kabiny. M1 využívá hladkou magnetickou desku se světelnými indukčními segmenty. Nástupiště M1 prodlouženo na 44 m; nástupní body odpovídají třem článkům.
- `transport-lab.html`: samostatný 3D prohlížeč stejných modelů s rotací, zoomem a ovládáním dveřních panelů. https://gonza11125.github.io/Epic-hra/transport-lab.html
- Jízdní řád a stav cestujícího zachovány. Interiér je zatím samostatná kabina, nikoli průchozí souprava všech tří článků. A2 zatím bez přepravy hráče.
- Syntaxe změněných JS a prohlížeče ověřena; skutečný vizuální test v prohlížeči a na iPadu zatím neproveden.

## 0.1.3.6 — Cestující
- M1 je dostupný pro nastupování v Údolí 07 a Haven během stání. Výstup automaticky v druhém dostupném regionu, pokud jej cestující nezruší; ruční výstup je možný ve zpřístupněné stanici.
- `passenger.js`: samostatná 3D kabina s uličkou, sedadly, panoramatickými okny, animovanou krajinou a palubním displejem. Jízda trvá podle jízdního řádu, vzdálená krajina je zatím vizuální simulace, ne souvislá planeta.
- Uložení v4 zachovává stav cestujícího a polohu v kabině. Migrace v3 a starších uložených her zůstává dostupná. Atlas nepovoluje teleportování během jízdy.
- M1 má tři herní minuty pobytu v mezilehlé stanici. Herní hodiny zpomaleny na 0,011 herní hodiny za sekundu. V Haven lze otevřít odjezdy u nástupiště.
- 10 kontrol cestujícího, 3 kontroly ukládání a 6 kontrol upraveného jízdního řádu prošlo v dílčích testech; syntaxe hlavního skriptu a modulů ověřena. Vykreslování a hraní na iPadu zatím neověřeno.
- Nova Aster zatím není přístupná pro výstup, vlak přes ni projíždí podle simulace. A2 zatím nepřepravuje hráče. Orbitální stanice a kulatá planeta následují.

## 0.1.3.5 — Živá doprava
- `transitSchedule.js`: deterministická simulace polohy každého spoje, příjezdů, minutového pobytu v mezilehlých stanicích, obratu na konečné a dalšího odjezdu. Funguje přes půlnoc a nezávisle na právě navštíveném regionu, pokud běží herní čas.
- `transitVehicles.js`: nové procedurální modely maglevu M1 a antigravitačního shuttle A2. Viditelné příjezdy, odjezdy a posuvné panely dveří. M1 je vykreslován v Údolí 07 i Haven, A2 v Údolí 07. V Haven přibyla zkušební trať a nástupiště.
- Odjezdová tabule a mapa reagují na stav dopravy; herní čas nyní běží i při otevřené tabuli. Vozidlo stojící ve stanici lze prozkoumat, zatím do něj nelze nastoupit. Vzdálené úseky jsou simulovány datově, ne souvislým 3D terénem. Orbitální a lunární linky jsou stále plánované, bez viditelných lodí.
- 11 kontrol jízdního řádu a stavů vozidel prošlo; syntaxe změněných skriptů zkontrolována. Vykreslování a výkon na skutečném iPadu dosud neověřeny.
- Další verze 0.1.3.6: skutečné nastoupení, přeprava cestujícího a vystoupení v dostupném regionu. Kulatá planeta zůstává samostatným technologickým milníkem.

## 0.1.3.4 — Transit 07
- `transitStations.js`: přestavěná původní stanice se zakřivenou střechou, prosklením, automatickými dveřmi, čekárnou, informačním pultem a dvěma nástupišti. Původní expediční rádio je zachováno.
- `transitSchedule.js`: šest stanic a čtyři plánované okružní linky M1, A2, O1 a S4. Výpočet odjezdů, příjezdů, čekání, pořadí zastávek, intervalů a přechodu přes půlnoc.
- Odjezdová tabule v hale se aktualizuje podle místního herního času; interakcí POUŽÍT/E lze zobrazit přehled odjezdů a tras celé sítě. V panelu je čas pozastaven. Linky jsou zatím plánované, nejezdí po nich funkční vozidla.
- Pět kontrol jádra jízdních řádů prošlo, syntaxe změněných skriptů zkontrolována. GPU a skutečný iPad neověřeny.
- Další milníky: provozní data, skutečné nastupování a jízda, orbitální shuttle, stanice Orion a přestupy. Kulatá planeta bude samostatný prototyp s pohybem po sféře, lokální gravitací, streamingem terénu a testem návratu na výchozí místo. Stávající regiony jsou stále malé rovinné mapy; obcházení planety zatím není možné.

## 0.1.3.3 — Architektura budoucnosti
- `housing5000.js`: znovupoužitelná knihovna modulárních obytných budov se zakřivenou střechou, panoramatickým prosklením, terasou, automatickými posuvnými dveřmi a interiéry.
- Údolí 07: dva obytné moduly AURA (H-01) a NOVA (H-02) a komunitní centrum FORUM (C-01). V interiérech jsou lůžka, kuchyňské moduly, sedačky, stoly, osvětlení a informační panely.
- Budovy mají kolize stěn a vybavení, volné vstupy, lokální osvětlení a vlastní značky na mapě. Déšť se uvnitř nových budov nevykresluje. U starých uložených pozic zasahujících do nových překážek se hledá nejbližší volný bod.
- Panely lze prozkoumat tlačítkem POUŽÍT. Vlastnictví, volné stavění a obyvatelé zatím nejsou implementováni.
- Syntaxe hlavního skriptu a upravených modulů prošla. Skutečný vizuální test a funkčnost na fyzickém iPadu dosud neověřeny.

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
