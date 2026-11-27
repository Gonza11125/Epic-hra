<!-- Převedeno z PDF „NEXUS chat a Master Plan“ (27. 11. 2026), příloha NEXUS Master Plan 1.0 z 24. 11. 2026. Text je převod z PDF; tabulky mohou mít zjednodušené formátování. -->

NEXUS — Infinite Civilizations
MASTER PLAN / Game Design Document / Technical Design / Produkční
roadmapa
Revize zadání: 1.0 • 24. 11. 2026
Výchozí stav repozitáře: 0.1.4.6 – Cinematic Atmosphere
Heslo: Infinite worlds. One life. Your choice.
Repozitář: https://github.com/Gonza11125/Epic-hra
Účel: jednotný podklad pro pokračování vývoje v ChatGPT Work, na PC a později i na iPadu.

   Tento dokument spojuje uživatelovu vizi, dosavadní rozhodnutí a ověřený stav vybraných zdrojových souborů.
   Detailní mechaniky, čísla, architektura a akceptační kritéria označené jako návrh jsou vývojové zadání, nikoli
   tvrzení o hotové hře. Nejde o závazek, že všechny ambice lze realizovat v jednom kroku nebo na jednom zařízení.

Obsah
   1. Vize, zásady a cílový zážitek
   2. Herní smyčky a život postavy
   3. Vesmír, planety, geografie a čas
   4. Elyra a první ukázková oblast Údolí 07
   5. Grafika, modely, zvuk a atmosféra
   6. Civilizace, NPC a fungující města
   7. Ekonomika, práce, majetek a podnikání
   8. Stavění, výroba, infrastruktura a kolonie
   9. Vozidla, veřejná doprava a vesmírné lety
 10. Politika, právo, diplomacie a konflikty
 11. Průzkum, příroda, mise a dlouhodobý život
 12. Singleplayer, multiplayer, platformy a UX
 13. Technická architektura a datový model
 14. Inventura současného prototypu a rizika
 15. Přechod do Unreal Engine a první vertical slice
 16. Roadmapa – 10 generací a 100 pracovních etap
 17. Testování, pravidla vydávání a definice hotové práce
 18. Otevřená rozhodnutí, zdroje a předávací instrukce pro Work

1. Vize, zásady a cílový zážitek
1.1 Původní myšlenka [požadavek]
NEXUS je ambiciózní sci-fi simulace života v multigalaktickém vesmíru. Hráč není předurčený hrdina s jedinou cestou.
Je obyvatelem světa, který může prožívat obyčejný život, pracovat, cestovat, podnikat, stavět, objevovat neobydlené
planety, vstoupit do politiky, působit v dopravě nebo se zapojit do mezistátních konfliktů. V jedné části vesmíru může
panovat mír a prosperita, zatímco jinde probíhá válka nebo rozpad civilizace. Svět má fungovat i tehdy, když hráč není
jeho středem.

Příběhový rámec dosavadního prototypu je rok 5000. Prostředí kombinuje inspiraci Star Wars (rozsah, atmosféra,
futuristická architektura), GTA (svoboda jednání a každodenní městský život), Star Citizen (pocit měřítka, průzkum a
lodě) a No Man's Sky (volný průzkum planet). Jde o inspiraci zkušeností a designovými principy, nikoliv o kopírování
cizích postav, modelů, názvů nebo příběhů. NEXUS musí mít vlastní identitu.

1.2 Pilíře hry [požadavek]
    • Svoboda: žádná povinná hlavní kariéra; smysluplné alternativy k boji. Příběhové úkoly nepodmiňují běžný pohyb
      světem.
    • Živý svět: doprava, obyvatelé, ekonomika a politické události mají příčiny a časový průběh nezávisle na hráči v
      rozsahu skutečně implementované simulace.
    • Souvislý prostor: planeta je skutečně kulatá, nemá umělý konec. Pohyb pěšky, vozidlem, lodí či veřejnou dopravou
      má být v rámci hratelného světa přirozený; diagnostické přesuny nejsou cílovou mechanikou.
    • Měřítko: člověk, dům, hora, město, loď, planeta i galaxie mají vzájemně uvěřitelné rozměry. Dálka je skutečná,
      nikoli jen dekorace.
    • Kvalita: jedna krásná a funkční oblast má přednost před množstvím prázdných map. Hráč se má chtít zastavit a
      obdivovat krajinu bez úkolu.
    • Samostatný singleplayer: i bez serveru musí být hra plnohodnotná. Multiplayer přichází postupně; neblokuje
      vývoj jádra.
    • Platformy: hlavní cíl je vysoce kvalitní nativní PC hra v Unreal Engine 5; iPad a mobil jsou plánované
      optimalizované platformy. Web je současný prototyp a nástroj pro rychlé zkoušení.

1.3 Cílové situace hráče [návrh]
   1. Obyvatel Údolí 07 ráno vyjde z domova, dojde na stanici, nastoupí do vlaku, cestou sedí nebo se volně pohybuje
      kabinou, vystoupí ve městě a pracuje.
   2. Průzkumník vyrazí pěšky do hor, pořídí záznam neznámého druhu, rozhodne se vrátit nebo strávit noc v
      přístřešku. Krajina i počasí ovlivňují cestu.
   3. Podnikatel nakoupí materiál, zajistí dopravu, vyrobí zboží, prodá je a rozšíří provoz; ceny odpovídají skutečným
      zásobám a poptávce v modelu.
   4. Osadník odletí na neobydlenou planetu, najde bezpečné místo, získá oprávnění nebo založí autonomní základnu,
      zajistí energii a zásobování a pozve další obyvatele.
   5. Politik začne na místní úrovni, získá podporu, prosazuje rozpočet a zákony, jedná s jinými státy a nese důsledky
      rozhodnutí.
   6. Cestující letí z povrchu na orbitu, přestoupí na lunární expres a později navštíví další soustavu. Není nucen vlastnit
      loď.

1.4 Co není cílem
Neslibovat nekonečně mnoho ručně vytvořeného obsahu, skutečnou simulaci každého člověka v každé galaxii v
reálném čase ani fotorealistický výkon na každém telefonu. Procedurální svět musí být doplněn autorskými místy.
Fyzika a vzdálenosti musí být konzistentní; zrychlený čas či mezihvězdné cestování jsou vědomé herní konvence, které
musí být popsány. Nezavádět nákladný online backend před funkčním offline jádrem.

2. Herní smyčky a život postavy
2.1 Start a ovládání [návrh, částečný prototyp]
Nová hra: výběr jména, vzhledu, základního oblečení a startovního místa; později původ, občanství a počáteční profese.
Začátečník má srozumitelný tutoriál, který lze přeskočit. První start na pevnině Údolí 07 v pohledu třetí osoby; první
osoba volitelná. Základ: chůze, běh, skok, přikrčení, úkroky, přirozené zrychlení, brzdění, schody, svahy, dveře, výstup z
vozidla, posezení. Animace sleduje skutečnou rychlost, směr a stav kontaktu se zemí.

Interakce: jednotné tlačítko Použít/E, kontextové menu u složitějších objektů; jasný dosah, popisek, důvod
nedostupnosti. PC myš/klávesnice a ovladač, iPad dotykový joystick a pravá část pro kameru, nezávislé více dotyků.
Nastavení citlivosti, invertování os, velikosti HUD a kamery. Kamera nesmí projít skálou ani stěnou, hráč se nesmí
samovolně vracet na start při každém pohybu.

2.2 Krátká, střední a dlouhá smyčka
    • Minuty: pohyb → pozorování → interakce → získání informace, suroviny, zboží nebo zážitku → rozhodnutí kam
      dál.
    • Desítky minut: cesta, pracovní směna, průzkumná výprava, zakázka, nákup, stavba, společenská událost.
    • Hodiny: dům, vztahy, reputace, kvalifikace, provoz firmy, investice, vozidlo, nová trasa.
    • Dny herního času: vývoj osady, změny cen, volby, obchodní dohody, rozvoj kolonie, diplomatická krize.
    • Dlouhodobě: vlastní životní příběh, majetek, význam v civilizaci, síť kolonií, rozšíření do dalších soustav.

2.3 Stav hráče a inventář [návrh]
Identita má stabilní ID. Profil eviduje pozici a orientaci, stav zdraví, oblečení a vybavení, peníze, inventář, majetek,
dovednosti, vztahy, reputaci podle civilizace, oprávnění, smlouvy, objevy a deník. Inventář: stohy položek, typy,
hmotnost/objem, kontejnery, sloty vybavení, přesun a zahození, obchodní převod. Vlastnictví položky nesmí vznikat
duplikací při uložení nebo výpadku.

Zdraví a přežití mají být konfigurovatelné. V běžném městském životě nesmí příliš otravovat; na nehostinné planetě
mají význam kyslík, teplota, tlak, jídlo, voda a bezpečný návrat. Smrt, léčba a ztráta vybavení jsou otevřené designové
otázky; návrh je férový respawn nebo záchrana s omezenou ztrátou, nikoli definitivní zničení dlouhodobé hry bez volby.

2.4 Dovednosti, vztahy, reputace
Dovednosti se rozvíjejí prováděním činností, výcvikem a zkouškami; neomezují základní svobodu pohybu. Licence k
dopravě, řemeslu nebo úřadu jsou lokální pravidla. NPC si pamatují relevantní události, dluhy a vztahy. Reputace se
mění konkrétními událostmi, ne univerzální stupnicí dobra/zla. Přátelství, rodinný život a případná romantika jsou
pozdější návrh; jejich rozsah není schválený.

3. Vesmír, planety, geografie a čas
3.1 Hierarchie a existující názvy
Vesmír NEXUS → galaxie Aurelia → soustava Solaris (hvězda G2V) → Elyra, Nyx, Vesta a Orion. Stabilní ID: nexus,
aurelia, solaris, elyra, nyx, vesta, orion. Další galaxie a soustavy zatím nejsou vytvořeny.

 Těleso      Současné údaje katalogu                                          Vývojový stav

 Elyra       Obyvatelná planeta, poloměr 1 737,4 km, 27 h, fikční 0,96 g      Globální generátor a prototyp průzkumu

 Nyx         Ledový měsíc Elyry, 1 720 km, 54 h, 0,18 g                       Katalog, žádný hratelný povrch

 Vesta       Pouštní planeta, 4 900 km, 31 h, 0,71 g                          Katalog, žádný hratelný povrch

 Orion       Orbitální stanice                                                Katalog/plán, nepřístupná

Hodnoty gravitace jsou herní parametry, nikoli výpočty z hmotnosti. Parametry orbit v katalogu nejsou fyzikální
efemeridy. U všech těles později rozhodnout fyzikální konzistenci a hratelné vzdálenosti. Planety mohou být
obyvatelné, neobyvatelné, civilizované, neosídlené, chráněné, těžební či konfliktní. Každá potřebuje unikátní katalog
klimatu, zdrojů, atmosféry, geologie, civilizací a pravidel přístupu.

3.2 Kulové planety a skutečné měřítko
Elyra má obvod přibližně 10 916 km a plochu 37,93 milionu km². Její povrch nelze celý držet v paměti. Šest stěn cube-
sphere se dělí do hierarchických dlaždic; LOD (level of detail) mění geometrii podle vzdálenosti a zátěže. Identita
sektorů je stabilní, generátor deterministický a souřadnice globální. Místní modely jsou v metrech, kamera používá
plovoucí počátek. Při chůzi gravitační směr míří k planetárnímu středu; sever, východ a lokální svislice vycházejí z
pozice na kouli. Při průchodu pólem nebo hranou cube-sphere nesmí nastat teleport ani otočení postavy bez vstupu.

Návrh finálního systému: spojované hrany různých LOD, asynchronní streaming, předsunuté načítání ve směru pohybu,
fyzikální dlaždice garantované v bezpečném okolí, rozumná predikce pohybu, řízené uvolňování RAM/VRAM, nezávislé
vrstvy povrchu, oceánu, vegetace, zástavby a dopravy. Uložené stavby se nesmějí znovu náhodně generovat. Globální
reliéf je základ; autorské úpravy jako Údolí 07 jsou vrstva nad ním.

3.3 Biomy a civilizační pásma Elyry
12 současných biomů: oceán, pobřežní vody, polární led, tundra, chladný les, mírný les, travnatá krajina, poušť, suchá
savana, tropický les, vysoké hory, horský sníh. Klimatická klasifikace využívá zeměpisnou šířku, nadmořskou výšku a
procedurální vlhkost. Pro každý biom je třeba vytvořit vlastní sadu hornin, podloží, povrchů, vegetace, zvuků, počasí,
živočichů a zdrojů. Hranice biomů musí mít plynulé přechody. Přirozená příroda není podmíněná politickou hranicí.

Čtyři současné geografické civilizační oblasti (ne funkční státy): Svaz Elyry, Meridiánské společenství, Aurorská
konfederace a Nezávislé pohraničí. V atlasu jsou definovány barevnými oblastmi, středy a úhlovým dosahem; nejde
ještě o skutečné hranice, které může hráč překračovat s právními důsledky. Zbývající pevnina může být divoká nebo
bez příslušnosti. Každá civilizace později potřebuje ústavu, symboly, ekonomiku, styl architektury, kulturu, instituce,
infrastrukturu a vztahy. Tyto podrobnosti nejsou zatím stanoveny.

3.4 Čas, rotace, oběžné dráhy a simulace
Základ Elyry je 27hodinový den. Starší původní regiony a jízdní řády pracují s 24h hodinami; je nutné sjednotit obě
vrstvy. Návrh: jeden monotónní čas simulace v sekundách, odvozený místní den, kalendář a časová pásma pro každé
těleso, jednoznačná konverze jízdních řádů. Zrychlení času v singleplayeru nesmí rozbíjet dopravu či fyziku; ve
společném online světě autoritativní čas serveru. U vzdálených oblastí počítat agregované intervaly a při příchodu
materializovat stav, nikoli simulovat miliony NPC v každém snímku.

4. Elyra a první ukázková oblast Údolí 07
4.1 Současná geografie [v kódu]
Údolí 07 (36° N, 18° E), Haven (33,25° N, 17,5° E), Nova Aster (32° N, 13° E, zatím katalog), další tři plánovaná centra
civilizací. Údolí je autorská oblast integrovaná do společné koule, hlavní rozsah 2,5 × 3,5 km = 8,75 km², detailní střed v
návrhu 1,2 × 1,6 km, přechodové pásmo do přirozeného terénu 1 km. Vzorkovaná výšková amplituda přibližně 458 m.
Základní převýšení vůči moři 1 535 m plus místní reliéf; umístění osady je zvolená fikce.

4.2 Zóny a přesné orientační body
Lokální souřadnice x = východ, z = sever, metry. Střed (0, 0) je budoucí osada na plošině 240 × 240 m. Jižní panorama
(15, −1350), severní průchod (−35, 1450), západní vyhlídka (−660, −420), východní rokle (640, 520). Dva horské
hřebeny obepínají centrální údolí; západní je dominantní, východní členitější. Hlavní trasa 3,305 km (14 m šířky),
západní 1,060 km (12 m), východní 0,723 km (10 m). Největší sklon vzorkovaných os tras 8,65 %, 27,31 %, 18,84 %.
Není to dosud důkaz celé průchodnosti na zařízení. Přesné souřadnice segmentů v valley-07.json.

4.3 Plán krajiny a osady
Cílem je bezpečný domovský prostor s divočinou za okrajem: jemné dno údolí, pěší stezky, vyhlídky, svahy, skalní kapsy,
čitelné průchody, silný horizont. Postava může vyjít na hřeben, sejít do rokle a opustit oblast do stejného světa. Nejde o
arénu s bariérou. Budoucí voda musí být navržena s výškovým profilem: jezírko s konstantní hladinou, přítok z vyššího
svahu, odtok níže po spádu, případně vodopád na přirozeném zlomu. Nejdřív navrhnout hydrologii a případnou lokální
úpravu reliéfu, až potom shader vody. Mosty, pěší přechody a břehy nesmí zablokovat stávající cesty.

Původní osada má být přenesena na připravenou plošinu jako skutečná geometrie s cestami a interiéry. Jednotná
transformace staré místní mapy do globálních souřadnic, ověření rozměrů 240 × 240 m a rezerva pro rozvoj. Ne
všechny budovy musí být na plošině; doprava a vyšší stavby mohou vyžadovat rozšíření územního plánu. Existující
hratelné objekty zachovat nebo převést po ověření. NPC, obchody, služby a doprava musí postupně dostat skutečnou
funkci, nejen vzhled.

4.4 První ukázková verze (vertical slice) [priorita]
Jedna oblast s plnohodnotnou postavou, plynulým pohybem, stabilním uložením, kvalitním terénem, hustou vegetací,
filmovou atmosférou, vodou, přístupnými domy a stanicí; později první NPC a funkční veřejná doprava. Hráč začne
venku na zemi, dojde pěšky do domu, může pokračovat do lesa k vodě a vrátit se bez přesunu menu. Výsledkem musí
být hraný a zaznamenaný průchod, ne pouze screenshot, mapa nebo test počtu vrcholů. V této fázi nezvětšovat počet
planet, dokud není kvalita pohybu a lokálního světa ověřena.

5. Grafika, modely, zvuk a atmosféra
5.1 Vizuální identita [požadavek a návrh]
Realistické, nikoli kreslené sci-fi. Velké siluety hor a monumentů, filmové světlo, přirozený opar, bohaté okolí lidského
měřítka, světlá organická architektura, modrozelená a fialová mimozemská příroda. Každá civilizace má rozlišitelný
designový jazyk, například jinou siluetu střech, materiály a signalizaci. Konkrétní styly ostatních civilizací teprve
navrhnout. Nepoužívat generované referenční obrázky jako důkaz hotových 3D modelů.

5.2 Katalog assetů – systematická výroba
    • Terén: skalní stěny, útesy, vrstvy hornin, balvany, štěrk, jemná půda, bláto, písek, sníh, led, mokré břehy, travní
      podloží, eroze. PBR sady: albedo, normal, roughness, případně metalness, height/AO; měřítko textury, mipy a
      triplanární projekce podle potřeby.

    • Příroda: stromy, keře, kapradiny, traviny, houby, korálové formy, semena, opadané části; variace výšky, větví,
      korun, růstová stádia, sezónnost až později. Současných 9 druhů viz kapitola 14.
    • Budovy: obytné moduly, domy, bytové domy, výškové věže, stanice, terminály, obchody, restaurace, kliniky,
      instituce, dílny, sklady, továrny, elektrárny, úřady, kosmodromy; střechy, dveře, okna, schody, výtahy, interiéry a
      kolize.
    • Mobiliář: postele, sedačky, kuchyně, skříně, stoly, židle, panely, hygienické vybavení, lampy, lavičky, značení,
      odpad, informační a prodejní terminály.
    • Doprava: chodníky, silnice, cyklotrasy pokud odpovídají světu, magnetické koridory, nástupiště, signalizace,
      hangáry, rampy, křižovatky, výhybky, záchytné plochy.
    • Vozidla: maglev, antigrav shuttle, osobní vozidla, nákladní transportéry, servisní drony, průzkumné rovery, kurýrní
      lodě, nákladní lodě, osobní shuttle, flotilová plavidla a záchranné prostředky.
    • Postavy: modulární tělo, obličej, vlasy, oblečení, pracovní a expediční obleky, přilby, vybavení, animace, IK
      chodidel, manipulace s předměty, vstup do vozidla, sezení a gesta.
    • Fauna: vlastní mimozemští drobní tvorové, větší býložravci, predátoři, vodní a létající živočichové; modely, rig,
      animace, zvuk, chování, habitat, rozmnožování a potrava ve zjednodušeném modelu.
    • VFX: voda, pěna, déšť, sníh, prach, jiskry, oheň, anomálie, hologramy, pohony, atmosférický vstup, světelné efekty
      a biologická luminiscence.

Každý asset má ID, verzi, rozměry, pivot, jednotky, materiály, LOD, kolizní mesh, původ/licenci, náhled, počet
trojúhelníků, případně rig/animace a kompatibilní platformy. Model musí být zkontrolován v engine na scéně v lidském
měřítku, ne jen jako samostatný soubor. Priorita: originální assety nebo legálně použitelné licencované zdroje; žádné
neoprávněné kopírování ze zmíněných her.

5.3 Atmosféra a voda
Den/noc, sluneční směr, hvězdy, oblaka, opar, déšť, vítr, bouřky, sníh podle biomu. PC cílově dynamické osvětlení a
stíny, volumetrie, odrazy a kvalitní materiály; iPad omezené stíny, jednodušší obloha, levnější odrazy a LOD. Osvětlení
interiérů a exteriérů musí mít stabilní expozici, čitelnost a plynulý přechod. Současný web má procedurální oblohu a
lokální stíny ve vysoké kvalitě; ne plnou filmovou grafiku.

Voda: hloubka, barva podle podloží, průtok, rychlost, pěna, průhlednost, odrazy, hranice hladiny, zvuk a reakce postavy.
Návrh fyziky: plavání nebo brodění dle hloubky, vodní vozidla později. Omezit efekt na platformní výkon; fyzika vody a
render nesmí být v rozporu. První vodní systém je prioritou 0.1.4.7.

5.4 Zvuk a hudba
Prostorové zvuky kroků na trávě, skále, kovu a mokrém podkladu; vítr, déšť, voda, listí, fauna, vzdálené město; stanice,
dveře, motor, odjezdové hlášení, interiéry s odlišnou akustikou. Ambientní hudba reagující na místo a situaci, s
možností vypnutí, bez povinné dramatické hudby při běžném životě. Originální nebo licencovaná hudba. Oddělené
hlasitosti, titulky a čitelné zvukové signály.

6. Civilizace, NPC a fungující města [plán]
6.1 Obyvatelé jako agenti
Každý detailní NPC má stabilní identitu, domov, práci, rozpočet, potřeby, denní režim, vztahy, dovednosti, občanství a
případné závazky. Simulační úkoly: vstát, jíst, dojet do práce, vykonat úkol, nakoupit, navštívit službu, odpočívat a
reagovat na událost. První prototyp má několik NPC s viditelnou rutinní činností; rozšiřovat až po ověření navigace a
výkonu. Dialogy mají kontext, identitu a jasné výsledky. Generativní dialog může být doplněk, ne jediná závislost a ne
zdroj neautorizovaných změn světa.

Navigace: pěší síť, lokální navmesh na zakřiveném terénu, přechody přes dveře a mosty, doprava přes jízdní řád, čekání
a přestupy. Důležití NPC mají přesný stav, vzdálení se agregují podle profesí, domácností a zón. Při materializaci
zachovat totožnost a majetek, ne vytvářet nové peníze či lidi bez pravidla.

6.2 Funkční město
Zóny: bydlení, obchod, veřejné služby, výroba, logistika, výzkum, administrativa, rekreace, doprava a příroda. Každá
budova má provozní dobu, vstupy, kapacitu, odpovědného vlastníka/provozovatele, inventář nebo poskytované služby
a infrastrukturu. Dveře, interiéry, patra a chodby musí být hratelné, nikoli všechny věže okamžitě; vzdálené neotevřené
budovy označit pravdivě. Městská doprava propojuje skutečné cíle. Obyvatelé potřebují energii, vodu, bydlení, zboží,
práci a bezpečí; výpadek způsobuje omezení služeb a změny chování.

6.3 Služby a instituce
Obchod prodává a nakupuje skutečný inventář; klinika ošetřuje podle dostupnosti; úřad eviduje licence, majetek a
občanství; výzkumný ústav přijímá data a poskytuje zakázky; policie řeší přestupky v mezích fikčního práva; stanice a
kosmodrom odbavují cestující. Zásobování a ceny jsou propojené s ekonomikou. Město se mění podle výstavby,
poptávky a politických rozhodnutí, nikoliv jen při odemčení levelu.

7. Ekonomika, práce, majetek a podnikání [plán]
7.1 Peníze a trhy
Návrh nejprve jednotná účetní měna, později případné lokální měny a směna. Každý peněžní převod vytváří
jednoznačný záznam: kdo, komu, kolik, za co, kdy, ID transakce. Ceny se odvozují z nákladů, nabídky, poptávky, zásob,
přepravy, rizik a pravidel trhu; první jednoduchý model musí být stabilní a transparentní. Obchodování může být
okamžité nebo objednávkové. Daně, poplatky, mzdy a pokuty mají určeného příjemce; tvorba/zánik peněz jsou
explicitní mechanismy. Přehled cash flow a transakcí, žádné tiché násobení prostředků po načtení hry.

7.2 Práce a profese
První civilní kariéry: kurýr, pracovník zásobování, řidič nebo člen dopravní obsluhy, technik, výzkumník, stavebník,
obchodník. Později těžař, zemědělec, pilot, zdravotník, veřejná správa a bezpečnostní složky. Práce má smlouvu nebo
zakázku, požadavky, místo, čas, odměnu a vyhodnocení. Hráč může odmítnout, změnit zaměstnání nebo pracovat pro
sebe. Automatizovaná směna je volitelná, když hra potřebuje šetřit čas, ale aktivní práce má vlastní hratelnost.
Nevytvářet stovky nudných povinných kliknutí.

7.3 Majetek, bydlení a finance
Domy a pozemky mají stabilní ID, vlastníka, cenu, stav, nájemní vztah a přístupové oprávnění. Koupě, prodej, pronájem,
vybavení interiéru, skladování, spotřeba energií, údržba a případná rekonstrukce. Vlastnictví se odlišuje od fyzického
držení a použití. Úvěr a banka až po stabilní základní ekonomice: jistina, splátka, úrok, zajištění, riziko nesplacení; hráč
musí vidět závazky. Začít jednoduchým peněžním účtem a jedním bytem/domem.

7.4 Podnikání
Založení firmy, název, vlastnictví, licence, provozovna, zaměstnanci, mzdy, výrobní kapacita, materiál, objednávky, sklad,
logistika, příjmy a náklady. Hráč zvolí míru řízení: osobně plní zakázky nebo zaměstnává NPC. Podnik může růst,
zastavit výrobu, prodávat jiným hráčům v budoucnu, uzavírat smlouvy nebo zaniknout. Návrh: jednoduchá účetní kniha
s příjmy/výdaji, bilančním přehledem zboží, cash flow a výsledkem. Nikoli povinný plnohodnotný účetní software. Test
rovnosti toku zdrojů a finančních převodů.

7.5 Výroba a obchodní síť
Suroviny → zpracování → díly → hotové výrobky → distribuční sklady → maloobchod. Recept potřebuje vstupy, čas,
energii, kapacitu a případně odbornost. Žádná výroba bez zásob, pokud to není explicitní generátor přírodního zdroje.
Regionální ceny a doprava vytvářejí obchodní příležitosti. Později planetární a mezihvězdný obchod, cla, pojištění,
ztráty, kontrakty a cenové šoky. Vzdálené ekonomiky se počítají agregovaně; jejich tok musí být stejný jako při
návštěvě.

8. Stavění, výroba, infrastruktura a kolonie [plán]
Stavěcí systém: výběr pozemku, průzkum podloží, náhled modelu, kontrola sklonu, kolize, vlastnictví a pravidel zóny,
náklady materiálu, potvrzení, postup výstavby, provoz. Moduly se spojují přes konektory, orientují podle místní
gravitace, ukládají globální transformaci. Budovy lze rozšířit, opravovat, zařídit a odstranit. Při demolici rozumné vrácení
části materiálu. Editor nemá měnit cizí budovu bez oprávnění. První MVP je jeden dům a jeden sklad s funkčním
interiérem, bez kompletního simulátoru stavebnictví.

Infrastruktura: energie (zdroj, síť, odběr, akumulace), voda (zdroj, úprava, distribuce), vzduch/teplo v nehostinné oblasti,
odpad, komunikace, cesty a sklady. Výpadky mají viditelné příčiny. Moduly sítě mají stabilní uzly a spojení, limity
kapacity a měřitelné toky. Začít s jedním zdrojem energie a několika spotřebiči; později přenos mezi regiony.

Kolonizace: průzkum neobydleného tělesa, posouzení prostředí a zdrojů, přistání, dočasný habitat, energie, kyslík podle
planety, doprava, zásobování, první stavby a nábor obyvatel. Rozvoj od samostatné základny k osadě a městu; politický
status, práva k území a obchod. Neobydlená planeta nesmí být automaticky osídlena po kliknutí. Hráč musí mít
možnost bydlet sám mimo civilizaci, pokud si zajistí podmínky.

9. Vozidla, veřejná doprava a vesmírné lety
9.1 Současný dopravní návrh
 Linka     Trasa                                       Interval v nynějším 24h modelu    Stav

 M1        Údolí 07 – Haven – Nova Aster – Údolí 07                            30 min    Prototyp cestujících Údolí–Haven

 M2        Údolí 07 – Nova Aster – Haven – Údolí 07                            30 min    Prototyp cestujících, opačný směr

 A2        Údolí 07 – Elyra Spaceport – Údolí 07                               20 min    Lokální demonstrace vozidla

 O1        Spaceport – Orion – Spaceport                                       60 min    Plán

 S4        Orion – Nyx – Orion                                                120 min    Plán

LUMEN R24: 24 m, dva průchozí články, 16 sedadel, skutečné dveřní otvory, madla, zavazadlové police, displeje.
Původní A2 Solaris Cityliner a magnetické koridory jsou návrhové assety. M1/M2 se v původních regionech pohybují
dle jízdního řádu, nastupování/vystupování má vlastní stav. Dálková krajina kabiny se zatím simuluje, nikoli vykresluje
ze skutečné planety. Vzdálenosti z geografie jsou řádově desítky až stovky km, jízdní doby, rychlosti a délky tratí
přepočítat po integraci. Žádné tvrzení, že současné intervaly jsou fyzikálně validované.

9.2 Veřejná doprava jako propojený systém
Jízdní řád, zastávka, linka, nástupiště, čas příjezdu/odjezdu, čekání, kapacita, zpoždění, přestupy, jízdné, stav spoje
(příjezd, stání, jízda, obrat). Vozidla mají trasu, identitu a pokračují v simulačním čase mimo dohled. Hráč vstoupí do
kabiny pěšky, může se posadit, vstát a procházet. Dveře mají bezpečnostní stav. Výstup na správné straně a ve
správném místě, žádný povinný automatický výstup. Cestující a jeho věci musí zůstat ve vozidle při uložení. Skutečná
trať a krajina musí být sladěné s planetou; přestupy fungují i bez vlastního vozidla.

9.3 Osobní a nákladní vozidla
Řízení s akcelerací, brzděním, zatáčením a kamerou; pozice sedadla, vstup a výstup, úložný prostor, spotřeba, stav,
servis, vlastnictví, parkování. Antigravitační konvence definovat herně (stabilizace vůči radiále, bezpečná výška,
rychlost, energie), nikoli tvrdit reálnou fyziku. Nákladní vozidla přepravují skutečné zboží mezi sklady, nepřenášejí ho
pouhou změnou ceny. První funkční rover před letem do vesmíru.

9.4 Vesmírné lodě a orbitální pohyb
Plán: hangár, nástup, interiér, kokpit, letová kontrola, vzlet, let atmosférou, dosažení oběžné dráhy, navigace, dokování,
výstup a přistání na jiném tělese. Různé lodě podle účelu: kurýrní, osobní, nákladní, průzkumné, servisní, později
bojové. Systémy: pohon, energie/palivo, náklad, kyslík, poškození, servis, posádka, dokovací porty. Nejprve jediná loď
se srozumitelným řízením a jasnou hranicí herních konvencí, poté rozšiřování.

Přechod povrch → atmosféra → orbita → jiná planeta musí působit souvisle. Technicky je přípustná skrytá změna
referenčního rámce/streamované scény, pokud nezpůsobuje ztrátu polohy, času, nákladu a kontextu. Mezihvězdné a
mezigalaktické lety potřebují definovanou fikční metodu zrychleného cestování; mechanika FTL není schválená.
Skutečné cestovní doby ve světle let nejsou vhodný gameplay bez abstrakce. Navrhnout osobní let i veřejný spoj.

10. Politika, právo, diplomacie a konflikty [plán]
10.1 Civilizace a státní struktury
Civilizace je soubor obyvatel, kultury, hospodářství a institucí; stát je konkrétní politický subjekt a jurisdikce. Nemusí
být totéž. Každý politický subjekt má ID, název, území, občany, instituce, vedení, rozpočet, právní pravidla, vztahy a
dějiny. První implementace může používat jeden stát s místní samosprávou a jeden sousední stát; teprve potom
konfederace, federace, autonomní osady a nezávislé kolonie. Politická mapa se odlišuje od klimatické a vlastnické mapy.
Změna hranic vyžaduje legitimní herní událost, nikoli náhodné přepsání biomu.

10.2 Politický život hráče
Občanství, pobyt, práva, veřejné podněty, hlasování, kandidatura, kampaně, politické organizace, volby a mandáty.
Úspěch není závislý jen na penězích; NPC posuzují důvěru, postoje, služby, bezpečí a životní podmínky. Kandidát má
program a záznam rozhodnutí. Hráč může být běžným občanem, místním zastupitelem, správcem osady nebo později
státním představitelem. Mandáty, kompetence a střet zájmů musí být jasné. Návrh zákona → projednání → hlasování
→ vyhlášení → účinnost → kontrola výsledku. Hra simuluje fiktivní režimy, nepřebírá skutečné právní systémy bez
výslovného rozhodnutí.

10.3 Právo, veřejný rozpočet a správa
Zákony se modelují jako datová pravidla: přístupová oprávnění, povolení stavby, vlastnictví, daně, obchodní omezení,
bezpečnostní předpisy a sankce. Každé pravidlo má jurisdikci a účinnost. Úřady mohou vyřizovat žádosti, licence a
registrace. Veřejné příjmy a výdaje mají evidované transakce: doprava, infrastruktura, zdravotnictví, výzkum,
bezpečnost a investice. Rozpočet ovlivňuje provoz institucí. Rozhodnutí jsou dohledatelná v historii; hráč vidí příčinu a
následek. První verze má malý srozumitelný soubor pravidel, nikoliv rozsáhlý právní simulátor.

10.4 Diplomacie
Vztah mezi státy není jediné číslo: obchod, důvěra, bezpečnost, přístup, hranice, závazky. Smlouvy mohou zajišťovat
obchod, průchod, společný výzkum, příměří nebo vzájemnou pomoc. Jednání má návrh, protinávrh, přijetí, dobu
platnosti a možnost porušení. Důsledkem mohou být vyšší náklady dopravy, uzavřené přechody, migrace, změna cen
nebo nové příležitosti. Neutrální hráč může zůstat mimo mocenské spory.

10.5 Bezpečnost a konflikty
Fikční kriminalita, strážní složky, vyšetřování, přestupky, soudní mechanismus, pokuty či omezení přístupu. Vojenské
organizace, obrana, střety, občanské války, povstání, flotily a diplomatická řešení jsou pozdější herní systémy. Konflikt
má příčiny (zdroje, území, rozpad dohod), účastníky, cíle, stav, logistiku, důsledky a možnost skončit. Není nutné, aby
všude neustále probíhal boj. Civilní zásobování, škody, evakuace, obnova a mírová jednání mají vlastní hratelnost.
Bojové mechaniky navrhovat jako fiktivní herní abstrakci, nikoliv návod k reálným zbraním či násilí. Konkrétní věkové
hodnocení a míra zobrazení násilí nejsou rozhodnuté.

11. Průzkum, příroda, mise a dlouhodobý život [plán]
Průzkum se neomezuje na generované sbírání předmětů. Kartografie, záznamy živočichů a rostlin, výzkumná zařízení,
geologické vzorky, anomálie, přírodní úkazy, opuštěné stanice, historická místa a výhledy. Záznam nese polohu, datum,
typ objevu a případně fotografie. Expedice může přinést data, příjem nebo otevřít nové území. Původní expedice
zůstává volitelným úvodem; čtyři původní záznamy a fáze 0–5 jsou prototypové, nikoli definitivní hlavní kampaň.

Mise: ruční příběhové kapitoly, místní zakázky, události vyplývající ze stavu světa, průzkumné cíle, vlastní cíle hráče.
Každá má zdroj, podmínky, možné výsledky, odměnu a časovou logiku. Zakázka může zaniknout, pokud ji splní jiný
agent, ale hra musí informovat hráče. Žádné nekonečné povinné opakování bez účelu. Systém potřebuje deník, archiv,
mapové značky, prioritizaci, přepínač navigace a možnost úkol opustit. Základní průchod hrou nesmí vyžadovat
dokončení všech misí.

Ekologie: rostliny a fauna se vyskytují podle stanoviště, počasí a zdrojů; vzdálené populace jsou souhrnné. Fauna
reaguje na hráče, hledá potravu, odpočívá, migruje a vyhýbá se nebezpečí. Těžba a stavba mohou měnit lokální
prostředí; rozsah dopadů a obnovy se stanoví před implementací. První verze stačí s jedním druhem zvířete a
jednoduchou rutinní AI, následně se ověřuje stabilita ekosystému.

Dlouhodobá motivace: postupně získat domov, přátele, zaměstnání, vozidlo, přístup do nových míst, vybudovat podnik
či osadu; nebo cestovat bez majetku. Hra nemá vyžadovat každodenní přihlášení, umělé časové zámky či placení za
základní svobodu. Monetizace a obchodní model nejsou schválené; neimplementovat je bez rozhodnutí.

12. Singleplayer, multiplayer, platformy a uživatelské
rozhraní
12.1 Singleplayer [požadavek]
Hlavní režim funguje lokálně bez povinného serveru a připojení po instalaci nativní hry. Svět se ukládá, lze ho
pozastavit a pokračovat. Náročné části simulace mají deterministická pravidla, uložený čas a seed. Možnost více
uložených světů, manuální a automatické ukládání, bezpečná obnova, export/import uložených dat. Aktuální web
vyžaduje internet pro CDN a ukládá do localStorage pouze starou hru; samostatný explorer nemá potvrzené trvalé
ukládání. To je nutné doplnit, nikoli prezentovat jako hotové.

12.2 Multiplayer [požadavek dlouhodobě; návrh implementace]
   1. Oddělení klienta, autoritativní simulace a rendereru již při tvorbě singleplayer jádra.
   2. První kooperace s několika hráči v jedné oblasti, připojení/odpojení, pozice, animace, interakce, vozidla,
      synchronizovaný čas.
   3. Autoritativní server ověřuje pohyb, vlastnictví a převody; klient nezapisuje důvěryhodná data přímo. Predikce
      vstupu a korekce bez viditelného teleportování při běžném pohybu.
   4. Sdílené úkoly, obchod, majetek, soukromé/pro společné stavby, přístupová oprávnění, ochrana před ničením
      cizího majetku.
   5. Perzistence světa, více oblastí, interest management, instance, shard nebo zóny podle výsledků zátěžových testů.
      Crossplay PC/iPad až po potvrzení schopností platforem.

   6. Hráčské firmy, kolonie, samosprávy a státy v pozdější fázi. Online ekonomika oddělená od offline uložené hry
      nebo přísně definovaná pravidla přenosu; nepřenášet snadno upravitelný offline majetek do online světa.
   7. Bezpečnost a soukromí: přihlášení, role, revokace relace, omezení požadavků, logování citlivých změn, moderace,
      blokování a hlášení uživatelů, zálohy. Síťový protokol musí mít verzi a odmítat nekompatibilní data.

Žádný současný multiplayer není implementovaný. Cílový počet hráčů, rozpočet hostingu, provozní model a pravidla
interakcí budou rozhodnuty po kooperativním testu. Neoznačovat projekt za MMO, dokud nejsou prokázány zátěž a
provoz.

12.3 Platformy a ovládání
PC (Windows): hlavní kvalita a plná herní mechanika, klávesnice/myš, ovladač, nastavení grafiky. iPad: nativní
optimalizované sestavení až po ověření vývojového řetězce, dotykový joystick, stabilní UI, dynamické rozlišení a
omezené materiály/LOD. iPhone/mobil: plánovaná další optimalizace podle zařízení; ne garantovat shodnou kvalitu ani
všechny režimy. Web: zachovat stávající zkušební verzi pro iPad, nemusí být finální hra; nerozšiřovat jej donekonečna
namísto nativní migrace.

12.4 UX a přístupnost
HUD: zdraví a relevantní stav, kompas, kontext interakce, případně čas, cíl, peníze, upozornění. Diagnostické hodnoty
LOD, FPS a sektory pouze v dev režimu. Mapa: lokální navigace, planetární atlas, soustavy a galaxie; jednotlivé vrstvy a
vyhledávání. Inventář, charakter, deník, jízdní řád, finance, vlastnictví, stavební režim a politický přehled jako
konzistentní rozhraní, které nezabírá celou obrazovku bez důvodu. Dotykové ovládání musí fungovat současně při běhu
a otáčení; viditelné velké cíle, respektování bezpečných okrajů. Přepínač titulků, kontrastu, citlivosti, redukce
kamerového třesu a případné lokalizace; čeština nyní výchozí, další jazykové verze podle plánu.

13. Technická architektura a datový model [návrh]
13.1 Modulární rozdělení
 Modul                  Odpovědnost                                            Klíčové rozhraní / závislost

 Core                   čas, události, ID, konfigurace, log, stav              nezávislé na renderu

 Universe               galaxie, soustavy, tělesa, referenční rámce            katalog, souřadnice, čas

 Planet                 geografie, klimatické vrstvy, LOD, hydrologie          seed, povrchová výška, lokální up

 World                  sektory, osady, cesty, stavební a přírodní objekty     streamovaná data, entity registry

 Physics                chůze, radiální gravitace, kolize, vozidla             společný geometrický povrch

 Life                   postavy, NPC, potřeby, AI, rutiny a vztahy             nav, čas, inventář

 Economy                peníze, trhy, práce, produkce, smlouvy                 transakce, inventáře, vlastnictví

 Construction           pozemky, moduly, sítě, výroba staveb                   oprávnění, materiál, kolize

 Transport              jízdní řády, linky, vozidla, cestující, náklad         čas, navigace, fyzika

 Politics               státy, občanství, zákony, rozpočty, diplomacie         události a autorita

 Events                 mise, zpravodajství, dynamické události                publikované doménové události

 Visuals                scéna, assety, osvětlení, animace, audio, UI           čte stav, nevlastní ekonomiku

 Modul                  Odpovědnost                                                    Klíčové rozhraní / závislost

 Save                   verzovaný snapshot, migrace, journal, zálohy                   všechny perzistentní moduly

 Network                autorita, replikace, session, validace                         až po stabilním jádru

Herní logika nesmí být závislá na identitě objektu Three.js či na Unreal Actor jako jediném zdroji uloženého stavu.
Renderer materializuje entity, simulační vrstva drží pravidla a identitu. V Unreal použít C++ pro citlivá jádra a
Blueprinty/datové assety pro konfiguraci a obsah; konkrétní návrh adresářů a subsystémů ověřit na zvolené verzi UE.
Změny verzovat, testovat a recenzovat.

13.2 Souřadnice, čas a přesnost
Návrh dat: galaxyId/systemId/bodyId, globální pozice (směr + radiální vzdálenost nebo přesný planetární vektor),
orientace (kvaternion), lokální rámec, absolutní čas simulace. Místní fyzika používá metry, UE převod do centimetrů
musí být explicitní. Globální hodnoty ukládat s dostatečnou přesností; pro renderer transformovat na místní počátek.
Při cestě mezi tělesy měnit referenční rámec bez přepočítávání majetku nebo identity hráče. Jednotné API
surfaceHeight, gravityAt, toLocal, toGlobal, streamAround v návrhu, nejde o existující názvy API.

13.3 Datové entity
    • Body: ID, parent, seed, radius, gravity, atmosphere, rotation, orbit, generator revision.
    • Sector: ID, face/level/x/y, verze generátoru, výšková data/odvození, vrstvy, lokální entity, autorský patch.
    • Character: ID, profile, body, position, orientation, health, abilities, inventory, affiliations, active vehicle, task state.
    • NPC/Household: ID, domov, práce, potřeby, rozpočet, denní plán, sociální vazby, stav simulace.
    • ItemType/Stack: ID typu, jednotka, množství, metadata, stav; Container: kapacita a vlastník.
    • Account/Transaction: ID, protistrany, částka, měna, důvod, čas, jedinečnost a auditní historie.
    • Property/Building/Parcel: stabilní ID, transformace, půdorys, vlastník, oprávnění, stavební stav, síťové přípojky.
    • Company/Job/Contract: ID, role, zakázky, kapacita, finance, sklady, zaměstnanci.
    • Vehicle/Route/Trip: ID, vlastník, pozice, stav pohonu, sedadla, dveře, náklad, jízdní řád a cestující.
    • Faction/State/Law/Treaty: ID, území, členství, autorita, pravidla, čas účinnosti, vztahy.
    • Event/Quest: ID, příčina, stav, účastníci, čas, následky, historie.

Datová pravidla: jedinečná ID, validace vazeb, deterministické generování, explicitní verze schématu, transakční změny
důležitých dat, zákaz duplikací, čitelné logy. Načítání musí řešit chybějící či starší data. Nesmí dojít k tichému přepsání
celého save, pokud migrace selže.

13.4 Simulace ve třech úrovních
   1. Blízko hráče: detailní kolize, animace, interakce a navigace, fyzika, reálná poloha NPC a vozidel.
   2. Okolní region: hrubší trasy, události, hodinové harmonogramy, souhrnné zásoby; jen objekty potřebné ke hře jsou
      materializované.
   3. Vzdálený vesmír: agregované obyvatelstvo, produkce, obchodní toky, státní vztahy a důležité události,
      vyhodnocované po delších intervalech. Při vstupu se detaily rekonstruují z konzistentního uloženého stavu.

LOD simulace a LOD grafiky jsou nezávislé. NPC se nesmí zdvojit při přechodu mezi úrovněmi. Odlehlá flotila nemusí
mít každý model v paměti, ale pokud dorazí, její náklad a stav musí odpovídat simulaci.

13.5 Výkon, build a úložiště
Rozpočty stanovit měřením na konkrétním Windows PC a iPadu. Návrhové cíle 60 FPS na referenčním PC a stabilních
30 FPS v mobilním profilu nejsou slib. Profilovat CPU, GPU, p95/p99 frametime, RAM, VRAM, načítání, stutter, teploty
a baterii. LOD, HLOD, instancing, culling, streaming textur, shader cache, asynchronní načítání, zjednodušené kolize a

pooling. Při nedostatku paměti snižovat detail; ne mazat trvalá data. Vývojářský build obsahuje logy a diagnostiku;
distribuční build má bezpečné výchozí hodnoty a srozumitelné chyby. Velké binární assety spravovat s odpovídajícím
verzováním (např. Git LFS po ověření limitů); negenerovat obří celý svět do Git repozitáře.

14. Inventura současného prototypu (ověřený zdrojový
stav k 24. 11. 2026)
14.1 Co lze otevřít a co je v repozitáři
Zdrojový kód je nahrán do veřejného GitHub repozitáře. Následující adresy jsou známé cílové GitHub Pages odkazy,
nikoli potvrzené online nasazení v této revizi.

    • Původní hra: https://gonza11125.github.io/Epic-hra/
    • Planetární atlas: https://gonza11125.github.io/Epic-hra/planet-atlas.html
    • Planetární explorer: https://gonza11125.github.io/Epic-hra/planet-explorer.html?v=0146
    • Architektura – samostatný prohlížeč: https://gonza11125.github.io/Epic-hra/architecture-studio.html
    • Doprava – samostatný prohlížeč: https://gonza11125.github.io/Epic-hra/transport-lab.html

 Oblast                                  V repozitáři / dosavadní implementace               Co chybí / hranice

 Původní hra index.html                  Expedice, interakce, mapy, první/třetí osoba,       Plná kontinuita planety,
                                         Údolí a Haven jako původní lokální regiony          integrace nového terénu

 universe.js, regions.js                 Katalog Aurelia/Solaris, 2 dostupné regiony,        Jednotný globální save,
                                         save schema 4 a migrace                             jednotný čas, nové těleso

 elyra-geography.js                      Cube-sphere, klima, biomy, regionální reliéf,       Kompletní hydrologie, detail
                                         autorský patch Údolí                                všech biomů

 planet-atlas.html                       Interaktivní glóbus a vrstvy, volba souřadnic       Kompletní navigace
                                                                                             skutečnými lety

 planet-streaming.js                     Quadtree LOD, cache, okrajové pásy, postupná        Přesné spojování rozdílných
                                         výměna                                              LOD, skutečný GPU test

 planet-physics.js                       Radiální gravitace, geodetický krok, skok, výška    Kompletní kolize, plavání,
                                         trojúhelníku                                        navmesh, test na zařízení

 planet-explorer.html                    Chůze/let, animovaná postava, kamera, výběr         Trvalý globální save, původní
                                         míst, mapa údolí                                    osady, jednotná hra

 terrain-materials.js                    4 procedurální výškové vzory, triplanární shader,   Profesionální PBR sety, ověření
                                         export PNG 1024 × 256                               GLSL na GPU

 valley-flora.js, valley-                9 modelů, stabilní rozmístění, LOD, instancing,     Finální assety, optimalizace,
 nature.js                               základní kolize, vítr                               pokrytí zbytku planety

 planet-atmosphere.js                    Slunce, místní čas, obloha, oblačnost, hvězdy,      Volumetrie, úplný vizuální test
                                         opar, high lokální stíny                            a správné nasazení

 organicArchitecture.js a                Organické pláště a interiéry 14 budov v původní     Umístění do kulového Údolí,
 moduly budov                            mapě                                                funkční služby

 Oblast                                  V repozitáři / dosavadní implementace            Co chybí / hranice

 transitSchedule.js,                     Jízdní řády M1/M2, modely, stav cestujících,     Skutečné tratě na kouli, A2
 transitVehicles.js,                     simulovaná meziregionální cesta                  přeprava, O1/S4, Nova Aster
 passenger.js

 player5000.js                           Expediční oblek, animace chůze/běhu, kamera      Finální animace, komplexní
                                                                                          kontrolér a kolize

 elyra-planet-v1.json,                   Geografické metadata, souřadnice a návrhové      Nejsou kompletní Unreal
 valley-07.json                          trasy                                            import ani uložený svět

14.2 Assety a jména, která zachovat
Původní domy AURA H-01, NOVA H-02, ORBIT H-03, SOLA H-04, TERRA H-05, IRIS H-06, VELA H-07 a ZENITH
H-08; komunitní FORUM C-01; ASTER MARKET, HELIX Institute, VITA Centre, hala TRANSIT 07, dílna údržby. Luma
Gardens je veřejný prostor, ne samostatná čtrnáctá budova. Modely mají zaoblené střechy a prosklení, vybavené
interiéry, některé posuvné dveře, mapové značky a původní kolize. Je nutné ověřit všechny interiéry v novém světě.
Vzdálené věže a brány jsou zatím kulisy. Technologické assety: kurýrní loď A-17, servisní dron, kvantový vysílač,
občanský terminál, brána a rostlina Luma; nejsou všechny funkční zařízení.

Údolí – 9 druhů: Aurora (deštníkovník), Spire (jehlicový věžník), Veil (vějířovec), stříbrný keř, spirálová kapradina,
luminové houby, azurová tráva, čedičový balvan, vrstevnatá skála. Nominální výšky větších stromů 13/17/8 m podle
katalogu; skutečná instance se mění měřítkem a geometrie se ověřuje renderem. Mobilní rozpočet 2 900 objektů,
vysoký 4 350; testovaná množství se liší dle místa. Procedurální houby v nové vrstvě zatím nejsou skutečně emisní.
Vzdálené rostliny mohou mít výškovou odchylku od hrubšího LOD.

14.3 Historie vývoje v kostce
0.1.0 Probuzení – základ webové expedice; 0.1.1 Ozvěny údolí – počasí, mapa a deník; 0.1.2 Visual Overhaul – obloha,
terén, zvuk a grafické režimy; 0.1.3 Nový začátek – vesmírný katalog a Haven. Následují 0.1.3.1 modely roku 5000, .2
příroda, .3 bydlení, .4 stanice, .5 živá doprava, .6 cestující a postupné modely dopravy, občanských a obytných čtvrtí
(.6.2–.6.8).

0.1.4.0 kulová Elyra; .1 streaming; .2 gravitace a chůze; .3 základní materiály; .3a oprava výchozího pěšího režimu a
třetí osoby; .4 autorské Údolí 07; .5 Alien Nature; .6 Cinematic Atmosphere. .7–.9 jsou teprve plán: voda, integrace
osady, detaily. Historie číslování obsahuje nepravidelné podverze, nepřepisovat existující tagy/commity.

14.4 Testování: co je podložené a co ne
README uvádí dílčí numerické/strukturální kontroly: 464 (geografie), 17 144 (streaming), 1 336 (fyzika), 4 468
(materiály/reliéf), 3 600 kroků (oprava chůze), 4 233 (údolí), 74 530 (rozmístění přírody), 11 553 (atmosféra). Jedná se o
počty dílčích asercí z předchozího vývoje, nikoliv tisíce nezávislých end-to-end herních testů. Při sestavení tohoto
dokumentu jsem znovu načetl README, katalog, jízdní řády a manifesty, neprováděl nové runtime testy. Záznamy
popisují, že skutečné GPU, shader, iPad a Pages testy nebyly provedeny. Je potřeba replikovat testy v repozitáři, doplnit
spustitelnou CI sadu a provést reálné hraní.

Nejkritičtější nesoulad: původní lokální hra je cca 194 × 194 m s 24h časem a lokálním save. Nový explorer používá
společnou planetu 27h, ale dosud oddělenou scénu bez doloženého propojení stavu. Výběr startovního bodu a let
sondy jsou vývojová navigace, nikoliv hotová planetární doprava. Cílem není dále udržovat dva neslučitelné herní světy.

15. Přechod do Unreal Engine a první vertical slice
15.1 Rozhodnutí o platformě
Cílový engine je Unreal Engine 5 pro Windows. Předchozí práci není potřeba zahodit; JS generátory a metadata slouží
jako funkční specifikace a zdroj dat, nikoliv jako automaticky kompatibilní Unreal kód. Vytvořit samostatný nativní
projekt (nová větev/adresář po schválení), webovou verzi zachovat. Zvolit konkrétní stabilní verzi UE až podle dostupné
instalace a ověřené dokumentace. Na PC zkontrolovat hardware, disk, RAM, GPU, vývojový toolchain a skutečnou
možnost sestavit projekt. Pro iPad ověřit Apple build/signing řetězec (Mac/Xcode a příslušné vývojářské prostředky
podle aktuálních podmínek). Nenavrhovat iOS build bez ověření jeho dostupnosti. V této konverzaci nebyl Unreal
engine spuštěn, nativní projekt nebyl vytvořen ani zkompilován.

15.2 Přenést skutečné podklady, ne jen grafický nápad
    • Zachovat stabilní ID a souřadnice z manifestů, seed a pravidla generátoru. Vyrobit referenční testovací vzorky
      výšky, biome a polohy, porovnávat s nativním generátorem.
    • Pro Údolí 07 vyexportovat výšková data a polohy tras v definovaném rozlišení, formátu a souřadnicovém systému;
      vyřešit jednotky, orientaci a návaznost na globální kouli. Současný JSON sám neobsahuje celý mesh.
    • Zhodnotit Unreal Landscape pro lokální scénu versus vlastní sférickou dlaždicovou geometrii. Pro první nativní
      ukázku je přípustná lokální tangentová reprezentace, pokud má explicitní převod na planetární souřadnice a plán
      navazujícího sférického streamingu. Nevydávat lokální plochý test za hotovou kulovou planetu.
    • Přenést nebo znovu vytvořit vlastní modely v Blenderu/UE, export podle ověřeného pipeline (např. glTF/FBX),
      správný pivot, měřítko, LOD, materiály, kolize. PNG výškových map jsou pouze dílčí podklady.
    • Nativní kontrolér postavy, kolize a kamera jako první technická brána. Poté terén, vegetace, obloha, voda, osada a
      jednoduchý NPC. Unreal renderer může využít špičkové funkce na podporovaném PC; mobilní profil potřebuje
      alternativy. Ověřit skutečnou podporu zvolené verze a zařízení, ne předpokládat stejný Nanite/Lumen režim na
      iPadu.

15.3 První nativní release gate
   1. Projekt se na referenčním Windows PC sestaví, spustí a uloží verzi enginu a konfiguraci.
   2. Postava se objeví na validní podlaze, ovládá se plynule, běží, skáče, přechází svah, kamera neprochází terénem.
      Lze přepnout pohled.
   3. Hratelný úsek Údolí má viditelný horizont, skály, vegetaci, vodu a alespoň jeden přístupný dům; hranice
      případného testovacího úseku jsou jasně přiznané.
   4. Trasa z výchozího místa k orientačnímu bodu a zpět je odehrána bez resetu polohy. Uložení a načtení zachová
      polohu. Zaznamenat skutečný průchod a výkon.
   5. V další iteraci sjednotit osadu a globální povrch, přidat stanici a první spojení. Teprve po ověření plánovat další
      planetu.

16. Roadmapa – 10 generací, 100 pracovních etap
Tato roadmapa je konsolidovaný nový návrh rozpisu, navazující na původní generace 0.1–1.0 a aktuální číslování. Čísla
G01–G100 jsou stabilní ID úkolů, nikoliv již existující release tagy. Jednotlivé pracovní etapy lze rozdělit do více
menších verzí; nesmějí být označeny hotové jen proto, že je v kódu funkce nebo že prošel numerický test. U každé je
stručný rozsah a akceptační výstup. Pořadí může změnit pouze technická závislost či schválená priorita; nativní migrace
je průřezová a nemusí čekat na konec webových podverzí.

Generace 0.1 — Základ hratelného světa a Elyra
 ID      Úkol                               Výstup / kritérium dokončení

 G0      Audit a uchování prototypu         Inventura zdrojů, přesný commit, spuštění staré hry a atlasu, záloha save.
 1

 G0      Nativní základ a ovládání          Reprodukovatelný UE build na PC; vstup, kamera, pohyb, interakce a diagnostika.
 2

 G0      Globální katalog a souřadnice      Hierarchie, stabilní ID, převody a test přesnosti/pólů; zachovat Elyru.
 3

 G0      Kulový terén a streaming           Dlaždice, sousedé, švy, RAM rozpočet, bez viditelné díry při chůzi.
 4

 G0      Gravitace a postava                Chůze, běh, skok a kolize napříč hranou sektoru, normální 1./3. osoba.
 5

 G0      Údolí – terén, materiály a         Autorská oblast, tři pěší trasy, 9 druhů, ověřené povrchy, stabilní rozmístění.
 6       příroda

 G0      Údolí – atmosféra a voda           Místní den/noc, opar, vítr, jezírko/potok, správná hladina a průchod. Navazuje na
 7                                          0.1.4.7.

 G0      Údolí – integrace osady            Umístit budovy, interiéry, cesty, stanici na skutečný terén; navazuje na 0.1.4.8.
 8

 G0      Orientace, save a detaily          Mapa, deník, základ inventáře, POI, globální save a migrace; .9 a další.
 9

 G1      Vertical slice / QA                Reálný pěší průchod, výkon, build, opravy blockerů a vydání zdokumentované
 0                                          verze.

Generace 0.2 — Živá města a obyvatelé
 ID        Úkol                       Výstup / kritérium dokončení

 G11       Registr NPC                Identita, domov, profil a perzistence prvních agentů bez duplikace.

 G12       Pěší navigace              NPC samostatně projde cestu dům–stanice–obchod; řeší dveře a překážky.

 G13       Denní režim                NPC střídá domov, práci, odpočinek dle času a reaguje na zpoždění.

 G14       Dialog a reputace          Kontextová interakce, konkrétní důsledky, historie vztahu.

 G15       Domácnosti                 Vazba osob, bydlení, základ potřeb a rozpočtu.

 G16       Obchody                    Skutečné regály/inventář, jednoduchý nákup/prodej, omezené zásoby.

 G17       Veřejné služby             Funkční první klinika/úřad/výzkumné místo, provozní doba.

 G18       Doprava města              Ověřený pohyb vozidla, cestující nastupují a vystupují bez teleportu v místě.

 G19       Události a zakázky         Volitelné úkoly vznikají ze stavu NPC a služeb, deník sleduje výsledek.

 G20       Život mimo dohled          Agregovaný regionální stav, návrat stejné identity, zátěžový test.

Generace 0.3 — Ekonomika, bydlení, firmy a stavba
 ID       Úkol                       Výstup / kritérium dokončení

 G2       Účetní jádro               Jedinečné transakce, balance, bezpečný reload a žádné duplikace.
 1

 G2       Inventář a sklady          Převod položek, kapacita, vlastnictví, nákup spotřebuje peníze i zásobu.
 2

 G2       Práce                      První skutečná směna/zakázka s odměnou a podmínkou splnění.
 3

 G2       Trhy a ceny                Změna dostupné zásoby ovlivní cenu, transparentní limity a stabilita.
 4

 G2       Bydlení                    Koupě/pronájem jednoho domu, přístup, zařízení a uložení majetku.
 5

 G2       Modulární stavění          Náhled, validace pozemku a kolize, spotřeba materiálu, trvalá budova.
 6

 G2       Těžba a výroba             Surovina, recept, energie, zásoba, výrobek; audit množství.
 7

 G2       Podnik                     Vlastní firma, zaměstnanec, provozovna, sklad, příjmy a náklady.
 8

 G2       Energie a                  První fungující síť zdroj–spotřebič, výpadek ovlivní provoz.
 9        infrastruktura

 G3       Finanční rozšíření         Úvěr/poplatek/pojištění jen po ověření jádra; dlouhodobá simulace bez nekontrolované
 0                                   inflace.

Generace 0.4 — Vozidla, lodě a vesmírné cestování
 ID        Úkol                            Výstup / kritérium dokončení

 G31       Osobní vozidlo                  Vstup, řízení, parkování, výstup, uložení pozice.

 G32       Skutečné regionální tratě       M1/M2 spojí dva fyzicky ukotvené regiony; synchronizovaný čas a měřítko.

 G33       Antigrav a kosmodrom            Funkční A2, přístupný Spaceport, nástup a přestup.

 G34       První loď                       Funkční hangár, interiér, kokpit, kontrolér pohonu.

 G35       Atmosférický let                Vzlet, řízení výšky, bezpečné přistání na Elyře.

 G36       Orbita                          Přechod referenčních rámců, navigace a návrat bez ztráty stavu.

 G37       Stanice Orion                   Přístupná stanice, dokování, interiér, výstup z lodi.

 G38       Veřejná orbitální linka         O1 skutečně přepraví hráče ze Spaceportu na Orion a zpět.

 G39       Náklad, servis a palivo         Loď veze skutečné položky, spotřeba, doplnění a oprava.

 G40       Povrch–orbita–povrch            Odehraný celý průchod, uložení během přepravy, výkon a chyby.

Generace 0.5 — Nové planety a kolonizace
 ID        Úkol                       Výstup / kritérium dokončení

 G41       Obecný generátor těles     Další planeta bez duplikování kódu Elyry, stabilní seed a konfigurace.

 G42       Nyx                        Ledový povrch, vhodná gravitace, ochrana prostředí a skutečné přistání.

 G43       Vesta                      Pouštní povrch, vlastní klima, zdroje, příroda podle návrhu.

 G44       Lunární linka S4           Orion–Nyx, skutečný přestup, jízdní řád a kabina.

 G45       Ekosystém a fauna          První funkční druhy, stanoviště, chování a přiměřený výkon.

 G46       Průzkum a kartografie      Objevy, vzorky a mapa, trvalé polohy a výzkumné zakázky.

 G47       Neosídlený svět            Přistání bez civilizace, volný pohyb a ověřená pravidla přežití.

 G48       Koloniální habitat         Stavba základny, kyslík/energie podle prostředí, uložení.

 G49       Zásobování osady           Logistika, obyvatelé, výroba a spotřeba, přerušení dodávky má dopad.

 G50       Kolonizace end-to-end      Průzkum → základna → malá autonomní osada; reprodukovatelná hra.

Generace 0.6 — Státy, politika a civilizace
 ID       Úkol                       Výstup / kritérium dokončení

 G51      Státní registr             Území, instituce, občanství a jurisdikce s jasnou identitou.

 G52      Pravidla a licence         Přístupová pravidla, registrace majetku, účinnost a audit.

 G53      Místní samospráva          První orgán s kompetencí a veřejnými rozhodnutími.

 G54      Veřejný rozpočet           Příjmy a výdaje, prostředky na službu mění její kapacitu.

 G55      Kandidatura a volby        Ověřitelný průběh fiktivní volby, hlasování, mandát, výsledek.

 G56      Zákonodárství              Návrh, hlasování, účinnost a kontrola konkrétního pravidla.

 G57      Politické organizace       Program, členství, reputace, koalice a střídání mandátů.

 G58      Diplomatické vztahy        Dva státy, návrh smlouvy, uzavření a ukončení.

 G59      Hranice a obchodní režim   Změna oprávnění a poplatků, zachování vlastnictví i historie.

 G60      Dlouhodobá politika        Simulace vlády i opozice, změna vedení a následků bez rozpadu uloženého světa.

Generace 0.7 — Bezpečnost, konflikty, mír a obnova
 ID       Úkol                       Výstup / kritérium dokončení

 G61      Právní události            Fiktivní přestupek, evidence, důsledek, vysvětlení hráči.

 G62      Bezpečnostní NPC           Hlídka, reakce na událost, přiměřené pravidlo zásahu.

 G63      Abstraktní bojový základ   Herní poškození, obrana, bezpečný návrat, jasné ovládání.

 ID       Úkol                           Výstup / kritérium dokončení

 G64      Organizace a jednotky          Fiktivní role, rozpočet, stav, zásobování a velení.

 G65      Vesničtí a městští civilisté   Změna rutiny při krizi, možnost úniku a civilní práce.

 G66      Mezistátní konflikt            Datový stav, příčiny, cíle, územní dopady; může skončit.

 G67      Vesmírné střety                Fiktivní flotilová simulace a bezpečný přechod mezi režimy.

 G68      Povstání a občanská válka      Politická nestabilita, varianty vyjednávání a civilní následky.

 G69      Příměří a obnova               Dohoda, opravy, zásobování, návrat služeb a obyvatel.

 G70      Scénáře mír/konflikt           Dlouhodobý test: mírumilovný i konfliktní region fungují bez nutnosti boje hráče.

Generace 0.8 — Mezihvězdný obchod a cestování
 ID        Úkol                             Výstup / kritérium dokončení

 G71       Druhá soustava                   Katalog, vlastní tělesa a skutečný přístup alespoň do jedné lokality.

 G72       Mezisoustavový pohon             Schválená fikční mechanika, čas, cena, stav lodě, návrat.

 G73       Dálková navigace                 Mapa tras, rizik a přestupů, srozumitelná délka cesty.

 G74       Dálková osobní doprava           Linka a přestupy mezi soustavami bez nutnosti vlastnit loď.

 G75       Nákladní kontrakty               Skutečná zásoba je převedena mezi trhy a eviduje se platba.

 G76       Regionální specializace          Výroba, zdroje, ceny a závislosti mezi soustavami.

 G77       Obchodní dohody a cla            Pravidla ovlivní ceny a přístup, dohledatelné transakce.

 G78       Obchodní AI a logistika          NPC dopravci plní zakázky, reagují na nedostatek a zpoždění.

 G79       Dálkové události                 Výpadek dopravy nebo změna nabídky ovlivní návštěvníky i trhy.

 G80       End-to-end obchod                Nákup → převoz → prodej → reinvestice, bez duplikace při načtení.

Generace 0.9 — Další galaxie a velká simulace
 ID        Úkol                           Výstup / kritérium dokončení

 G81       Katalog více galaxií           Stabilní hierarchie a generátor s odlišnými pravidly regionů.

 G82       Mezigalaktické cestování       Schválená herní konvence, přechod rámce a uložení času/polohy.

 G83       Nové civilizace                Rozlišitelné kultury, instituce, architektura a ekonomiky.

 G84       Agregovaná populace            Vzdálený vývoj obyvatel, materializace konzistentních NPC.

 G85       Agregované trhy                Zásoby a obchodní toky bez plné simulace každého agenta.

 G86       Dlouhodobá diplomacie          Vztahy, historie událostí, stabilní výsledky po přechodu času.

 G87       Velké stavby a flotily         Datový model a vizuální reprezentace dle měřítka; postupné načítání.

 ID        Úkol                          Výstup / kritérium dokončení

 G88       Světové zprávy                Vysvětlení změn stavu a důsledků bez povinných úkolů.

 G89       Zátěž a konzistence           Dlouhé simulace, kontrola zdrojů, paměti, determinismu a obnovy.

 G90       Galaktická hratelnost         První skutečný životní příběh přes více soustav/galaxií s možností návratu.

Generace 1.0 — Ucelená hra a následná online cesta
 ID        Úkol                          Výstup / kritérium dokončení

 G91       Singleplayer 1.0 kandidát     Hratelné smyčky, ukládání, tutoriál, bez kritických ztrát dat.

 G92       Optimalizace a distribuce     Reálné buildy, test Windows, dostupné iPad sestavení podle možností, přístupnost.

 G93       Kooperativní technický test   Autoritativní session, dva hráči, pohyb, připojení/odpojení.

 G94       Sdílené interakce             Vozidlo, inventář a úkol, synchronizace bez duplikace.

 G95       Perzistentní kooperace        Server save, restart, vlastnictví, autorizace.

 G96       Crossplay                     Ověřená kompatibilní PC/iPad verze, společný svět a odlišné grafické profily.

 G97       Online ekonomika a            Validace převodů, přístupových práv, audit a moderace.
           ochrana

 G98       Škálování online oblastí      Interest management, replikace, zátěžové testy a provozní náklady.

 G99       Hráčské firmy a               Oprávnění, společné stavby, politická pravidla, ochrana menšin a majetku.
           samosprávy

 G10       Dlouhodobý online vesmír      Provozní plán, zálohy, monitoring, pravidla, řízené aktualizace a samostatný
 0                                       singleplayer.

Roadmapa 1.0 zahrnuje singleplayer jako první dokončenou hlavní hru, potom online iterace (v duchu původního
návrhu kooperace od 1.0.3 a dalších verzí až k 1.0.9). Nejde o slib konkrétního data, termínu nebo kapacity vývoje.
Milníky, které vyžadují drahé infrastruktury, schválit až na základě měření.

17. Testování, pravidla vydávání a definice hotové práce
17.1 Testovací vrstvy
    • Unit testy: souřadnice, gravitace, seed, výšky, jízdní řády, peněžní a inventární převody, práva, migrace. Uložit
      spustitelné testy a očekávané výsledky do repozitáře, ne pouze počet asercí v README.
    • Integrační testy: postava + terén + kolize, nastoupení do vozidla, uložení během cesty, nákup, stavba, změny NPC,
      přechod mezi regiony.
    • End-to-end hraní: reálná scéna v prohlížeči/enginu, lidská chůze bez teleportování, kamera, dveře, trasa, návrat,
      save/reload, případně síťové odpojení.
    • Grafický test: shader kompilace, artefakty, viditelnost, osvětlení, stíny, LOD švy, střet kolizí a renderu, screenshot
      a případně video ze skutečné hry. Referenční obrázky vždy označit jako reference.
    • Profilování: scénáře u osady, v hustém lese, na vyhlídce, během letu, při streamingu a přechodech světlo/tma.
      Zapsat hardware, nastavení, build, FPS/frametimes, RAM/VRAM, chyby a teploty dle dostupnosti.

    • Platformní test: Windows build, Safari/iPad web, případně skutečná nativní iPad aplikace. Nepřisuzovat
      desktopovému testu výsledky na mobilu.

17.2 Prioritní regresní scénáře
   1. Start na pevnině, kamera z třetí osoby, nezávislé otáčení a chůze, běh, skok, návrat na zem; 10 minut bez ztráty
      pohybu.
   2. Hranice detailního sektoru, změna LOD při pohybu, stejné objekty při návratu; žádná propadnutí pod terén ani
      reset.
   3. Plynulé dojít z plošiny k jižnímu bodu a zpět, následně západní cesta; trasy ověřit celé, ne jen vzorky a
      10sekundový běh.
   4. Dům: dveře, vchod, interiér, vybavení, kamera, průchod ven, uložení pozice uvnitř.
   5. Stanice: příchod pěšky, odjezdová tabule, nástup správnou stranou, pohyb v kabině, výstup, nový nástup, save
      během jízdy.
   6. Doprava přes půlnoc a 27hodinový den; jeden čas ve všech systémech.
   7. Koupě a prodej téže položky, přerušení save, opakování požadavku: žádné zdvojení majetku.
   8. Multiplayer později: připojení dvou klientů, konflikt o objekt, server restart, obnovit správné vlastnictví.

17.3 Standard jedné verze
Před úpravou: načíst aktuální repozitář, inventuru a relevantní kód, založit pracovní větev nebo jinak zachovat rollback.
Definovat konkrétní cíl, soubory, závislosti, riziko, test a akceptační kritéria. Po úpravě: syntaktická kontrola/build, unit
a integrační testy, pokud dostupné skutečný běh. Ověřit, že nevznikly mrtvé ovládací prvky, chybějící importy ani
nechtěná změna dřívějších funkcí. Aktualizovat README, changelog a testovací záznam. Commit uvádí skutečnou
změnu; nelze-li push/deploy, poskytnout patch nebo soubory a přiznat stav.

Status každého úkolu: Plánováno → Implementováno v kódu → Ověřeno algoritmicky → Ověřeno v enginu/prohlížeči
→ Ověřeno na cílovém zařízení → Vydáno. Stav nesmí přeskočit neprovedený test. Vydání na GitHub Pages potvrdit
skutečnou dostupností, ne pouhou změnou souboru v main. U nativního buildu evidovat hash/sestavení a cílové
zařízení. Kritická chyba blokuje vydání; grafický detail může zůstat v seznamu známých omezení. Žádné přísliby práce
na pozadí bez příslušné funkce.

18. Otevřená rozhodnutí, zdroje a zadání pro ChatGPT
Work
18.1 Nevyřešené body (nezaměňovat za požadavky)
 Rozhodnutí                                        Proč je důležité                          Kdy rozhodnout

 Konkrétní Windows PC, GPU, RAM, disk a UE         Určuje kvalitu a skutečný build           Před nativním projektem
 verze

 iPad model, OS, Mac/Xcode, podpis a               Určuje reálnou nativní dostupnost         Před iOS buildem
 distribuce

 Sférický nativní terrain pipeline a World         Velký technický risk; potřebuje           G02–G05
 Partition/streaming                               prototyp

 Jednotný čas a planetární save                    Aktuální 24h/27h nesoulad, ztráta         G03/G09, před dopravou
                                                   kontinuity

 Převod původní osady a plán tratí                 Plošina, rozměry, reálné vzdálenosti a    G08/G32
                                                   jízdní doby

 Rozhodnutí                                       Proč je důležité                        Kdy rozhodnout

 Přesný lore, kultura čtyř států, další galaxie   Vlastní identita, legislativa, design   Před G51/G83

 Hloubka survival, smrt, vztahy, obsah boje       Základní hratelnost a věkové            Před implementací příslušného
                                                  hodnocení                               systému

 Mezihvězdná a mezigalaktická cestovní            Měřítko a délka hraní                   G72/G82
 konvence

 Monetizace, rozpočet, tým, licence               Dlouhodobý provoz a rozsah              Před komerční distribucí

 Online model, kapacita, přenos offline save      Integrita ekonomiky, provoz,            G93–G100
                                                  bezpečnost

18.2 Zdroje ověřeného stavu
    • Dosavadní projektové konverzace o NEXUS, 24. 11. 2026: uživatelova vize multigalaktického světa, libovolného
      života, kulové planety přibližně velikosti Měsíce, postupného vývoje, vysoké kvality PC a iPadu, preference Star
      Citizen / No Man's Sky a souhlas s Údolím 07 jako ukázkovou oblastí.
    • GitHub main, načteno při přípravě dokumentu: README.md, blob
      22ac7134a29073b1c0c5b8f77dce471eff977fec.
    • universe.js, blob 1b79808656deb0c4c71f5ebbd7df050751ad9aab – tělesa, regiony, save schema 4 a čas.
    • transitSchedule.js, blob 7bb9787f005a26a843ced68d7946052ed4e89073 – linky a jízdní logika.
    • elyra-planet-v1.json, blob 5046b1c4484c5ef06666ce68f66fd7def0d92057 – manifest planety a biomů.
    • valley-07.json, blob 6c16b4ea0e50b45cc01cdecd348db4321ae31935 – údolí, body a trasy.
    • Poslední doložený commit dokumentace verze 0.1.4.6: bdadc5d5a9d66ffb6ab76c4fc34e2eb350305888. Není to
      ověření nasazeného buildu.

Rozšíření v kapitolách o budoucí ekonomice, politice, AI, technické architektuře a pracovních etapách jsou návrh
odvozený z vize; nebyla ověřována externí aktuální dokumentace Unreal/Apple. Při realizaci znovu ověřit konkrétní
verzi enginu, dostupné platformní funkce a požadavky.

18.3 Zadání, které lze vložit přímo do Work

   Pracuj na projektu NEXUS — Infinite Civilizations podle přiloženého NEXUS Master Plan. Jsi vývojový partner, ne
   pouze generátor návrhů. Načti aktuální repozitář Gonza11125/Epic-hra, ověř zdrojový stav, neztrať původní práci
   a rozliš webový prototyp od budoucího nativního Unreal Engine projektu. Vize: živý multigalaktický sci-fi svět,
   svobodný život hráče, kulové planety bez umělé hranice, města, ekonomika, doprava, civilizace, kolonizace,
   politika a konflikty. Plnohodnotný singleplayer, později multiplayer. Vysoká kvalita na PC a optimalizovaná verze
   pro iPad. Vizuální směr Star Citizen / No Man's Sky / Star Wars s vlastní originální identitou.

   Nejprve proveď skutečný audit spustitelnosti stávající 0.1.4.6 a identifikuj kritické chyby v ovládání, shaderu,
   načítání terénu a save. Pokud Work umožňuje prohlížeč nebo build prostředí, otestuj reálný průchod; jinak přiznej
   omezení a vytvoř reprodukovatelné testy a instrukce pro zařízení. Nezaměňuj numerické testy za skutečné hraní.
   Připrav nativní Unreal projekt až po ověření prostředí; neoznačuj ho jako sestavený, dokud build neproběhl.
   Zachovej funkční webový prototyp.

   Bezprostřední obsahová priorita: 0.1.4.7 Living Waters, potom 0.1.4.8 integrace původní osady na kulový povrch,
   0.1.4.9 detaily a POI. Pokud skutečný test odhalí blocker pohybu či renderu, oprav ho před novým obsahem.
   Údolí 07 je první vertical slice; další oblasti až po potvrzení jeho kvality. Voda musí mít skutečnou hladinu a
   průchodnost, osada musí být fyzicky umístěna na připravené plošině, postava musí projít mezi přírodou a domem
   bez teleportu.

   Každou pracovní etapu rozděl na malý realizovatelný rozsah, konkrétní implementaci, testy a výsledné soubory/
   commit. Aktualizuj README, eviduj otevřené chyby, rozhodnutí a status. Před nevratnou změnou, placenou
   službou nebo důležitým rozhodnutím mimo schválenou vizi si vyžádej schválení. Nezastavuj se u dalšího návrhu,
   pokud můžeš bezpečně dodat funkční kód. Nepředstírej nasazení, výkon, dokončení nebo budoucí práci.
   Rozpracované větší úkoly rozděluj do ověřitelných milníků G01–G100. Cílem není množství funkcí, ale propojená
   funkční hra s kvalitou, kterou lze skutečně předvést.

Konec Master Planu v1.0. Průběžně verzovat tento dokument při změně schváleného cíle, technické architektury nebo
release gate. Historický výchozí stav ponechat dohledatelný.

