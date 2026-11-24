[CmdletBinding()]
param([string]$EngineRoot, [switch]$CheckProjectOnly)
$ErrorActionPreference = 'Stop'

function Initialize-NexusDescriptor([string]$Path) {
    $bytes = [IO.File]::ReadAllBytes($Path)
    $prefix = [BitConverter]::ToString($bytes, 0, [Math]::Min(4, $bytes.Length))
    $utf8 = [Text.UTF8Encoding]::new($false, $true)
    $encoding = $utf8
    $skip = 0
    # Check four-byte signatures first: UTF-32 LE shares its first two bytes with UTF-16 LE.
    switch -Wildcard ($prefix) {
        'FF-FE-00-00' { $encoding = [Text.UTF32Encoding]::new($false, $true, $true); $skip = 4; break }
        '00-00-FE-FF' { $encoding = [Text.UTF32Encoding]::new($true, $true, $true); $skip = 4; break }
        'FF-FE*'      { $encoding = [Text.UnicodeEncoding]::new($false, $true, $true); $skip = 2; break }
        'FE-FF*'      { $encoding = [Text.UnicodeEncoding]::new($true, $true, $true); $skip = 2; break }
        'EF-BB-BF*'   { $skip = 3; break }
    }
    try {
        $json = $encoding.GetString($bytes, $skip, $bytes.Length - $skip)
        $descriptor = ConvertFrom-Json -InputObject $json -ErrorAction Stop
        if (!$json.TrimStart().StartsWith('{') -or $null -eq $descriptor.FileVersion) {
            throw 'Chybi objekt projektu s polozkou FileVersion.'
        }
    } catch {
        throw "Nelze precist Nexus.uproject (prvni bajty: $prefix). Soubor nebyl zmenen. Vezmi Nexus.uproject z rozbaleneho ZIPu. $($_.Exception.Message)"
    }
    if ($skip -eq 0) { return }

    # Keep the exact JSON text, including engine association, whitespace and local edits.
    $id = [Guid]::NewGuid().ToString('N')
    $temp = "$Path.$id.tmp"
    $backup = "$Path.$id.bak"
    try {
        [IO.File]::WriteAllText($temp, $json, $utf8)
        [IO.File]::Replace($temp, $Path, $backup)
    } finally {
        if ([IO.File]::Exists($temp)) { [IO.File]::Delete($temp) }
    }
    Write-Host "Nexus.uproject preveden do UTF-8 bez BOM. Zaloha: $backup"
}

try {
    $projectDir = Split-Path -Parent $PSScriptRoot
    $project = Join-Path $projectDir 'Nexus.uproject'
    Initialize-NexusDescriptor $project
    if ($CheckProjectOnly) {
        Write-Host 'Nexus.uproject: platny popis projektu v UTF-8 bez BOM.'
        exit 0
    }
    $saved = Join-Path $projectDir 'Saved'
    [void](New-Item -ItemType Directory -Force -Path $saved)
    if (!$EngineRoot) { $EngineRoot = $env:NEXUS_UE_ROOT }
    if (!$EngineRoot) {
        $paths = @()
        $launcher = Join-Path $env:ProgramData 'Epic\UnrealEngineLauncher\LauncherInstalled.dat'
        if (Test-Path -LiteralPath $launcher) {
            $paths += (Get-Content -LiteralPath $launcher -Raw | ConvertFrom-Json).InstallationList |
                Where-Object { $_.AppName -match '^UE_5\.' } | ForEach-Object { $_.InstallLocation }
        }
        $standard = Join-Path $env:ProgramFiles 'Epic Games'
        if (Test-Path -LiteralPath $standard) {
            $paths += Get-ChildItem -LiteralPath $standard -Directory -Filter 'UE_5.*' | ForEach-Object { $_.FullName }
        }
        $engines = @(foreach ($p in ($paths | Select-Object -Unique)) {
            $versionFile = Join-Path $p 'Engine\Build\Build.version'
            if (Test-Path -LiteralPath $versionFile) {
                $v = Get-Content -LiteralPath $versionFile -Raw | ConvertFrom-Json
                if ($v.MajorVersion -eq 5 -and $v.MinorVersion -ge 4) {
                    [pscustomobject]@{ Path=$p; Version=[version]("$($v.MajorVersion).$($v.MinorVersion).$($v.PatchVersion)") }
                }
            }
        })
        if ($engines.Count) { $EngineRoot = ($engines | Sort-Object Version -Descending | Select-Object -First 1).Path }
        else { $EngineRoot = (Read-Host 'Zadej slozku instalace Unreal Engine 5.4+ (napr. D:\Epic Games\UE_5.6)').Trim('"') }
    }
    $editor = Join-Path $EngineRoot 'Engine\Binaries\Win64\UnrealEditor.exe'
    $cmdEditor = Join-Path $EngineRoot 'Engine\Binaries\Win64\UnrealEditor-Cmd.exe'
    $build = Join-Path $EngineRoot 'Engine\Build\BatchFiles\Build.bat'
    foreach ($file in @($editor,$cmdEditor,$build)) { if (!(Test-Path -LiteralPath $file)) { throw "Chybi soubor $file" } }
    $version = Get-Content -LiteralPath (Join-Path $EngineRoot 'Engine\Build\Build.version') -Raw | ConvertFrom-Json
    if ($version.MajorVersion -ne 5 -or $version.MinorVersion -lt 4) { throw 'Projekt cili na Unreal Engine 5.4 nebo novejsi radu 5.x.' }
    $shortPathHelp = 'Zkopiruj slozku Unreal\Nexus ze ZIPu primo do C:\Hry\Nexus (nebo jine kratke cesty) a spust tam Start-Nexus.cmd.'
    if ($version.MinorVersion -eq 8 -and $version.PatchVersion -eq 4) {
        # This generated filename was reported by UBT for our Win64 Development target in 5.8.4.
        # Other engine configurations can use different filenames; UBT decides whether to proceed.
        $pch = Join-Path $projectDir 'Intermediate\Build\Win64\x64\NexusEditor\Development\UnrealEd\SharedPCH.UnrealEd.Project.ValApi.ValExpApi.Cpp20.h.dep.json'
        if ($pch.Length -ge 260) {
            Write-Warning "Pri sestaveni NexusEditor muze mit cesta k souboru PCH $($pch.Length) znaku (limit 260). $shortPathHelp"
        }
    }
    Write-Host "Unreal $($version.MajorVersion).$($version.MinorVersion).$($version.PatchVersion) - sestavuji NexusEditor"
    $projectPrefix = $projectDir + [IO.Path]::DirectorySeparatorChar
    $reportedLongProjectPath = $false
    $diagnosticPattern = '(?:^\s*|:\s*)(?:(?:fatal\s+)?error|(?:z[a\u00e1]va[z\u017e]n[a\u00e1]\s+)?chyba)(?:\s+(?:C|LNK|CS|MSB)\d+)?\s*:'
    $firstDiagnostic = $null
    $buildLog = $null
    & $build NexusEditor Win64 Development "-Project=$project" -WaitMutex -NoHotReloadFromIDE | ForEach-Object {
        if ($_ -match '^\s*Log file:\s*(.+?)\s*$') { $buildLog = $Matches[1].Trim('"') }
        if (!$firstDiagnostic -and $_ -match $diagnosticPattern) { $firstDiagnostic = [string]$_ }
        if ($_ -match '^\s*\[\d+ characters\]\s+(.+)$' -and
            $Matches[1].StartsWith($projectPrefix, [StringComparison]::OrdinalIgnoreCase)) {
            $reportedLongProjectPath = $true
        }
        $_
    }
    if ($LASTEXITCODE -ne 0) {
        $buildExitCode = $LASTEXITCODE
        # Some diagnostics reach the UBT log only. Use the file named by this build.
        if (!$firstDiagnostic -and $buildLog -and [IO.File]::Exists($buildLog)) {
            $match = Select-String -LiteralPath $buildLog -Pattern $diagnosticPattern -Encoding UTF8 -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($match) { $firstDiagnostic = $match.Line }
        }
        if ($firstDiagnostic) { Write-Host "Prvni chyba sestaveni:`n$firstDiagnostic" -ForegroundColor Red }
        if ($reportedLongProjectPath) { throw "UnrealBuildTool ohlasil dlouhou cestu uvnitr projektu. $shortPathHelp" }
        if (!$buildLog) { $buildLog = "$env:LOCALAPPDATA\UnrealBuildTool\Log.txt" }
        throw "UnrealBuildTool skoncil s kodem $buildExitCode. Podrobny vypis: $buildLog"
    }
    $mapFile = Join-Path $projectDir 'Content\Maps\Valley07.umap'
    if (!(Test-Path -LiteralPath $mapFile)) {
        $ready = Join-Path $saved 'NexusValley.ready'
        if (Test-Path -LiteralPath $ready) { Remove-Item -LiteralPath $ready }
        $scriptFile = Join-Path $PSScriptRoot 'build_level.py'
        $generationLog = Join-Path $saved 'Nexus-LevelBuild.log'
        Write-Host 'Pripravuji mapu, materialy a kolize. Prvni start muze trvat nekolik minut.'
        # Pass quoted paths as one native command line, including workspaces with spaces.
        $argsLine = '"{0}" /Engine/Maps/Entry -ExecutePythonScript="{1}" -abslog="{2}" -unattended -nosplash -stdout -FullStdOutLogOutput' -f $project,$scriptFile,$generationLog
        $process = Start-Process -FilePath $cmdEditor -ArgumentList $argsLine -NoNewWindow -Wait -PassThru
        if ($process.ExitCode -ne 0 -or !(Test-Path -LiteralPath $ready) -or !(Test-Path -LiteralPath $mapFile)) {
            throw "Vytvoreni mapy se nezdarilo. Podrobnosti najdes v $generationLog"
        }
    }
    Start-Process -FilePath $editor -ArgumentList ('"{0}" /Game/Maps/Valley07' -f $project)
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
