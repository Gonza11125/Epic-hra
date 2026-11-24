# NEXUS — Infinite Civilizations

Infinite worlds. One life. Your choice.

## 0.1.4.2 — Radial gravity and surface locomotion
- `planet-physics.js`: nezávislá fyzika chůze, běhu a skoku na kouli, radiální gravitace (fikční parametr Elyry 0,96 g na referenčním poloměru), transport směru pohybu po velké kružnici, měření polohy v metrech, zamezení chůze na oceán a na prudké výškové skoky. Kolize podlahy používá průsečík s trojúhelníkem skutečně aktivní dlaždice bez skirtů.
- `planet-explorer.html`: přepínání režimu sondy a chůze první osobou, přistání až po načtení terénu alespoň LOD 13, tlačítka běhu a skoku na dotyku, W/S, A/D, Q/E, Shift, mezerník na klávesnici. Logaritmický depth buffer a lokální počátek u kamery pro blízký terén. Rozpočet chůze 165/225 dlaždic, maximální LOD 18.
- 1 336 dílčích kontrol fyziky a geometrie: 22 kombinací polohy a rozpočtu, inverze souřadnic přes hrany a póly, velikost a směr gravitace, výška skoku cca 1,03 m a běh 15,6 m za 3 s v rovinatém testu, zamezení průchodu zakázanou oblastí. Syntaktické kontroly prošly. Prohlížeč, iPad, GPU, Pages a vizuální návaznost při přechodech LOD nebyly testovány.
- Zatím pouze základní pěší prototyp v exploreru, bez animovaného těla, plavání, kompletní kolizní fyziky a detailního terénu. Přechod na nativní Unreal projekt a integrace původních osad do povrchu zbývají.
 
## 0.1.4.1 — Planetary terrain streaming
- `planet-streaming.js`: adaptivní dělení všech šesti stěn koule, rozpočet sektorů, postupné generování (dva sektory za snímek), zachování staré sady do připravení nové, uvolňování nepoužívaných sektorů a lokální souřadnice vzhledem ke kameře. Oceány jsou vykresleny na hladině moře. Přechody LOD používají svislé okrajové pásy (skirts), nikoli přesné propojení triangulace.
- `planet-explorer.html`: samostatná sonda s dotykovým i klávesovým ovládáním, volitelnou výškou 150 m až 1 600 km, rychlostí 0,03 až 350 km/s a sklonem kamery, dvěma rozpočty LOD (105/165 sektorů), automatickým letem a diagnostickou sítí. Atlas předává vybrané souřadnice. Měřítko je skutečné, rychlosti sondy jsou testovací.
- 17 144 dílčích kontrol algoritmů (35 konfigurací výběru, úplnost pokrytí koule, absence překryvu rodičů a potomků, geometrie sektorů, bezpečná výměna sad a cache po dokončení přechodu). Cache během přechodu může dočasně překročit cílový limit. Prohlížeč/GPU/iPad a Pages neověřeny; žádná garance bezespárého vizuálního výsledku či FPS.
- Jde o prototyp letu nad základním terénem; nikoli chůzi postavy, fyzikální gravitaci, detailní vegetaci nebo hotový Unreal projekt. Původní mapy zůstávají oddělené.
 
## 0.1.4.0 — Elyra planetary foundation
- `elyra-geography.js`: deterministický kulový svět o poloměru 1 737,4 km (zadaná velikost Měsíce), obvod cca 10 916 km, plocha cca 37,93 milionu km². Reliéf, oceány, teploty, vlhkost, 12 biomů a 4 fiktivní civilizační oblasti. Souřadnice existujících regionů jsou propojeny s geografickým katalogem; Haven leží u generovaného pobřeží.
- `planet-atlas.html`: samostatný interaktivní glóbus, vrstvy biomů, civilizací a výšek, výběr polohy, sonda obíhající po velké kružnici, skutečný nebo zvýrazněný reliéf. V hlavní hře odkaz z galaktického atlasu. `elyra-planet-v1.json` a zdrojový generátor jsou podklady pro budoucí Unreal migraci, nikoli hotový Unreal projekt.
- `terrainTile`: šest stěn cube-sphere, hierarchické dlaždice, lokální souřadnice v metrech. 28 800 rovnoměrně plošně rozložených vzorků odhalilo všech 12 biomů a všechny 4 civilizační oblasti; 464 dílčích testů zahrnulo švy, indexy, platné pozice osad, oběh a sousední dlaždice. Neproveden test skutečného vykreslení na iPadu ani nasazení GitHub Pages.
- Hratelné původní mapy jsou nadále oddělené. Plynulé cestování po povrchu, fyzika, načítání terénu a spojování rozdílných LOD nejsou zatím implementovány. Husté textury, budovy, vegetace a populace se doplní postupně; civilizační oblasti jsou pouze geografické vymezení. Dříve uvedená gravitace 0,96 g je fikční parametr, nikoli fyzikální výsledek výpočtu z nového poloměru.
 
## 0.1.3.6.8 — Organická architektura Elyry
- `organicArchitecture.js`: společná parametrická knihovna dutých střech, zakřiveného obvodového prosklení, oblých vstupních portálů, světelných pásů a přístřešků. Světlá keramická estetika, plynule tvarované obloukové, křídlové, vrstvené a asymetrické profily.
- Přestavěno 14 přístupných budov: AURA, NOVA, FORUM, ORBIT, IRIS, SOLA, VELA, TERRA, ZENITH, ASTER MARKET, HELIX, VITA, hala TRANSIT 07 a dílna údržby. Půdorysy, interiérové vybavení, vstupy, expediční cíle a dopravní logika zachovány; kolize vycházejí z původních obdélníkových půdorysů.
- Statická geometrie každého nového pláště sloučena podle materiálu (nejvýše pět skupin v testovaných variantách). 3 608 vzorků výšky střechy a 120 strukturálních kontrol deseti parametrických variant prošlo. Náhradní třídy Three.js ověřují vlastní plochy a indexy, nikoli skutečné vykreslení, triangulaci trubic nebo válců, výkon na iPadu či vizuální shodu s referencemi.
- Nástupiště, okolní mobiliář, vzdálená silueta města a ostatní infrastruktura zatím používají stávající geometrii. Dalším krokem je vizuální kontrola v prohlížeči a detailní dolaďování podle referencí.
 
## 0.1.3.6.7 — Jižní obytná čtvrť
- `residentialQuarter.js`: šest domů ORBIT, SOLA, TERRA, IRIS, VELA a ZENITH ve třech architektonických stylech (oblouková, křídlová a terasovitá střecha), se zařízenými interiéry, automaticky posuvnými dveřmi, adresami a zahradními prvky.
- Dvě obytné oblasti navazují na Aster Market a Luma Gardens; šest pěších úseků, světelné lemování a šest lamp. Domy a nové chodníky zobrazeny na minimapě. Společná funkce cityClearance brání generování vegetace a kamenů v zastavěné oblasti.
- 354 statických prvků seskupeno do 14 instančních dávek; 84 dalších mesh objektů. 76 nových kolizních boxů. 240 strukturálních kontrol pomocí náhradních Three.js tříd ověřilo vchody, středové uličky, návaznost chodníků, chráněné body a konečné souřadnice. Syntaxe hlavního skriptu a nového modulu prošla. Skutečný GPU/iPad test zatím neproveden.
- Rozsah mapy se nemění. Vlastnictví a obyvatelé zatím nejsou aktivní. Doprava a původní úkoly nebyly měněny.
 
## 0.1.3.6.6 — Údolí 07: občanské čtvrti
- Nový modul `districts5000.js`: tři průchozí veřejné budovy Aster Market, Helix Institute a Vita Centre s prosklenými stěnami, tvarovanými střechami, odlišnými střešními detaily, interiérovým vybavením a informačními panely; Luma Gardens s fontánou, svítícími rostlinami a mobiliářem.
- Čtyři občanské zóny, šest propojujících pěších úseků se světelnými okraji, osm laviček a deset lamp. Nové zóny a půdorysy budov se zobrazují na herní mapě.
- Společný územní plán odstraňuje generované stromy, kameny, keře a trávu z nových staveb a tras. Déšť se nevykresluje v nových interiérech. Původní úkoly, vlaky M1/M2, uložená hra a přepínání pohledu zachovány.
- 120 dílčích strukturálních kontrol s náhradními Three.js třídami: 283 nových objektů, 49 platných kolizních boxů, průchod středem všech tří vchodů, kontrola chráněných bodů expedice a dopravy. Syntaxe upravených skriptů ověřena. Skutečný GPU a iPad test nebyl proveden.
- Obchody, klinika a výzkum jsou nyní prozkoumatelná místa, nikoli fungující ekonomické nebo zdravotní služby. Rozsah hratelné mapy zůstává přibližně 194 × 194 m; další rozvoj Údolí 07 má přednost před orbitálními stanicemi.

## 0.1.3.6.4 — LUMEN R24: tvarovaná karoserie
- Původní hranaté bočnice nahrazeny spojitými spline plochami s plynule se zužujícími čely. Panoramatická okna s oblými rohy, skutečnými otvory a zapuštěným zasklením; barevné pásy a popisy kopírují plášť. Tvarované posuvné dveře, senzorové pásy, světelný podpis, levitační moduly a střešní technika.
- Nová čalouněná sedadla, opěrky, madla, police, dveřní prahy a displeje. Zachován dvoučlánkový průchozí interiér, 16 sedadel, 24 m délka, nastupování a výstup chůzí, obě linky M1/M2. Nástup/výstup až po úplném otevření dveří.
- Design Lab má nový detail čela. Strukturální kontrola pomocí náhradních tříd Three.js ověřila generování konečných souřadnic a platné indexy vlastních ploch (cca 35 846 vrcholů a 57 380 indexovaných trojúhelníků na model v této kontrole), stav dveří a 73 bodů uličky. Syntaktická kontrola prošla. Nejde o skutečný GPU test; triangulace standardních Three.js geometrií, vizuální vzhled a výkon na iPadu nejsou ověřeny.

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
