# Run with Windows PowerShell 5.1 or pwsh. Fixtures live outside the repository.
$ErrorActionPreference = 'Stop'
$source = Join-Path (Split-Path -Parent $PSScriptRoot) 'Unreal/Nexus'
$work = Join-Path ([IO.Path]::GetTempPath()) ('Nexus encoding ' + [Guid]::NewGuid().ToString('N'))
$runner = (Get-Process -Id $PID).Path
$utf8 = [Text.UTF8Encoding]::new($false, $true)

function Check([bool]$condition, [string]$detail) {
    if (!$condition) { throw $detail }
}
function SameBytes([byte[]]$a, [byte[]]$b) {
    return [Convert]::ToBase64String($a) -ceq [Convert]::ToBase64String($b)
}
try {
    $dir = [IO.Directory]::CreateDirectory((Join-Path $work 'Tools'))
    $script = Join-Path $dir.FullName 'Start-Nexus.ps1'
    Copy-Item -LiteralPath (Join-Path $source 'Tools/Start-Nexus.ps1') -Destination $script
    $file = Join-Path $work 'Nexus.uproject'
    $json = [IO.File]::ReadAllText((Join-Path $source 'Nexus.uproject'), $utf8)
    $json = $json.Replace('"Category":', ('"EngineAssociation": "5.8", "LocalNote": "' + [char]0x0159 + '", "Category":')).Replace("`r`n", "`n").Replace("`n", "`r`n")
    $expected = $utf8.GetBytes($json)
    foreach ($encoding in @($utf8, [Text.UTF8Encoding]::new($true), [Text.Encoding]::Unicode,
                            [Text.Encoding]::BigEndianUnicode, [Text.Encoding]::UTF32,
                            [Text.UTF32Encoding]::new($true, $true))) {
        [byte[]]$before = $encoding.GetPreamble() + $encoding.GetBytes($json)
        [IO.File]::WriteAllBytes($file, $before)
        $log = & $runner -NoProfile -NonInteractive -File $script -CheckProjectOnly
        Check ($LASTEXITCODE -eq 0) ($log -join ' ')
        Check (SameBytes $expected ([IO.File]::ReadAllBytes($file))) "Conversion changed the JSON text."
        $backups = @(Get-ChildItem -LiteralPath $work -Filter '*.bak')
        if ($encoding.GetPreamble().Length) {
            Check ($backups.Count -eq 1) 'Expected exactly one original backup.'
            Check (SameBytes $before ([IO.File]::ReadAllBytes($backups[0].FullName))) 'Backup bytes differ.'
            Remove-Item -LiteralPath $backups[0].FullName
        } else { Check ($backups.Count -eq 0) 'UTF-8 was unnecessarily replaced.' }
        $lastWrite = [IO.File]::GetLastWriteTimeUtc($file)
        $log = & $runner -NoProfile -NonInteractive -File $script -CheckProjectOnly
        Check ($LASTEXITCODE -eq 0 -and [IO.File]::GetLastWriteTimeUtc($file) -eq $lastWrite) 'Second run rewrote the file.'
        Check (@(Get-ChildItem -LiteralPath $work -Filter '*.bak').Count -eq 0) 'Second run created a backup.'
    }
    foreach ($bad in @(
        [byte[]](255,123,125), [byte[]](255,254,123),
        [byte[]]([Text.Encoding]::Unicode.GetPreamble() + [Text.Encoding]::Unicode.GetBytes('{"broken":')),
        $utf8.GetBytes('{}')
    )) {
        [IO.File]::WriteAllBytes($file, $bad)
        $log = & $runner -NoProfile -NonInteractive -File $script -CheckProjectOnly
        Check ($LASTEXITCODE -ne 0) 'Expected invalid bytes/JSON to stop the launcher.'
        Check (SameBytes $bad ([IO.File]::ReadAllBytes($file))) 'Invalid input was modified.'
        Check (@(Get-ChildItem -LiteralPath $work -Filter '*.bak').Count -eq 0) 'Backup after rejected input.'
    }
    # Exercise the build entry point too. The absent fixture engine stops it after descriptor repair.
    [IO.File]::WriteAllText($file, $json, [Text.Encoding]::Unicode)
    $log = & $runner -NoProfile -NonInteractive -File $script -EngineRoot (Join-Path $work 'Missing engine')
    Check ($LASTEXITCODE -ne 0 -and ($log -join ' ') -match 'Chybi soubor') 'Default startup did not reach engine discovery.'
    Check (SameBytes $expected ([IO.File]::ReadAllBytes($file))) 'Default startup skipped descriptor repair.'
    Write-Host 'PASS: six encodings, exact backups, repeat runs, four rejected inputs and normal startup.'
} finally {
    if ([IO.Directory]::Exists($work)) { [IO.Directory]::Delete($work, $true) }
}
