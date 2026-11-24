# NEXUS • První výprava do Údolí 07

Nativní prototyp pro Windows a Unreal Engine 5. Na plošině stojí obytný modul s otevřeným vstupem. U pracovního stolu si můžeš přečíst terénní deník. Světelné sloupky vedou k pobřežní sondě jihovýchodně od osady. Data od sondy můžeš přinést zpět nebo se kdykoliv vydat po původních stezkách do hor.

## První spuštění na Windows

1. Rozbal celý ZIP. Otevři složku `Unreal/Nexus` a spusť **Start-Nexus.cmd**.
2. Spouštěč použije nejnovější nalezenou instalaci řady UE 5 od 5.4. U vlastní instalace můžeš zadat složku enginu. C++ projekt potřebuje kompilátor MSVC a Windows SDK odpovídající verzi UE. Ve Visual Studio Installer najdeš potřebné součásti v sadě **Game development with C++**.
3. Při prvním startu spouštěč sestaví modul NexusEditor, vytvoří materiály, modely a mapu a ověří podlahu u startu, hloubku jezírka a průchod dveřmi. Pak otevře mapu **Valley07**. Počkej na dokončení kompilace shaderů a stiskni zelené **Play**. Pro další otevření již připravené mapy můžeš použít stejný spouštěč.
4. Pokud sestavení skončí chybou, v okně zůstane výpis. Při chybě přípravy scény je podrobný záznam v `Saved/Nexus-LevelBuild.log`. První užitečný údaj je první hláška `error` nebo `LogPython: Error` s konkrétním názvem souboru či funkce.

Verzi lze zvolit příkazem `Start-Nexus.cmd -EngineRoot "D:\Epic Games\UE_5.6"`. Příklad cesty uprav podle své instalace. Vytvořené mapy a materiály najdeš v Content Browseru pod Maps, Flora a FieldMaterials. Při dalším startu se existující mapa otevře s uloženými úpravami. Všechny podklady pro sestavení jsou přiložené. Node.js se používá pouze při změně exportu ze zdrojového generátoru.

Pokud UnrealBuildTool ohlásí v souboru `Nexus.uproject` chybu `0xFF` na prvním bajtu, vezmi z opraveného ZIPu soubor `Tools/Start-Nexus.ps1`, nahraď jím stejný soubor ve svém projektu a spusť `Start-Nexus.cmd`. Spouštěč zkontroluje JSON a při rozpoznané značce kódování převede celý text do UTF-8 bez BOM. Původní bajty uloží do souboru `Nexus.uproject.<id>.bak` vedle projektu. Samotnou kontrolu a případnou opravu spustíš příkazem `Start-Nexus.cmd -CheckProjectOnly`.

## Ovládání

| Akce | Klávesy |
| --- | --- |
| Pohyb a rozhlížení | WASD a myš |
| Běh, skok | Levý Shift, mezerník |
| První / třetí osoba | V |
| Deník v domě, pobřežní sonda | E zblízka |
| Uložit / načíst polohu, kameru a stav průzkumu | F5 / F9 nebo K / L |
| Ukončit hraní v editoru | Esc |

Hra začíná venku. Uloženou výpravu obnovíš ručně. Ukládání vyžaduje pevný podklad. V editoru je soubor v `Saved/SaveGames/Nexus_Valley07_v1.sav`.

## Krajina a měřítko

Terén vychází ze stejného generátoru jako kulová Elyra, seed 61201, střed 36° s. š. a 18° v. d. Místní výřez má 2,5 × 3,5 km, rastr po 10 metrech a 35 kolizních dílů. Za vnějším okrajem výřezu další povrch v této verzi nepokračuje. Podrobné 3D rostliny a skály jsou soustředěné kolem plošiny a vody. Původních pět bodů a tři trasy zůstává v přibaleném manifestu.

Unreal X odpovídá severu, Y východu, Z výšce v centimetrech vůči místnímu výškovému základu. Převod bodu do globálního směru poskytuje `valleyDirection(UE_Y / 100, UE_X / 100)` v kořenovém `elyra-geography.js`. Absolutní výška v metrech je `Scene.baseElevationMeters + UE_Z / 100`. Projekt používá místní vodorovnou soustavu a svislou gravitaci. Voda má průchozí dno, pevnou úroveň jezírka a sklon na obou přilehlých úsecích. Pohyb odlesků v Unrealu zajišťují normály vodního materiálu.

## Stav ověření

- Datový export v této změně prošel porovnáním všech 88 101 výškových bodů, kontrolou cest, spádu vody a poloh vegetace. Regresní test je v `tools/check-valley.mjs` v kořeni repozitáře.
- Součástí zdrojového projektu je příprava mapy a kontrola jejích kolizí přímo v editoru. První sestavení pro Windows, otevření v UE, průchod hráče a výkon na cílovém PC čekají na ověření. Součástí stažení jsou zdroje a data, hotové herní EXE vzniká až samostatným zabalením v Unrealu.
- Při prvním hraní projdi od startu ke stolu v modulu, otoč kameru u dveří, dojdi k sondě, ulož na břehu, vrať se do domu a obnov pozici. Souvislý průchod a načtení pozice uvnitř jsou podmínky pro první hratelné vydání.

[Dokumentace Epic k vývojovému prostředí pro C++](https://dev.epicgames.com/documentation/en-us/unreal-engine/setting-up-your-development-environment-for-cplusplus-in-unreal-engine)
