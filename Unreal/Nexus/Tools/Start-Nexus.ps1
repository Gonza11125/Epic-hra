[CmdletBinding()]
param([string]$EngineRoot)
$ErrorActionPreference = 'Stop'
try {
    $projectDir = Split-Path -Parent $PSScriptRoot
    $project = Join-Path $projectDir 'Nexus.uproject'
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
    Write-Host "Unreal $($version.MajorVersion).$($version.MinorVersion).$($version.PatchVersion) - sestavuji NexusEditor"
    & $build NexusEditor Win64 Development "-Project=$project" -WaitMutex -NoHotReloadFromIDE
    if ($LASTEXITCODE -ne 0) { throw 'Sestaveni se nezdarilo. Zkontroluj prvni chybu vyse a instalaci C++ toolchainu a Windows SDK.' }
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
