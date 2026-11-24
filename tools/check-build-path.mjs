// Exercise the real launcher with a stand-in for Build.bat. No Unreal install required.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const work = mkdtempSync(path.join(tmpdir(), 'nx-path-'));
const source = fileURLToPath(new URL('../Unreal/Nexus/', import.meta.url));
const win = process.platform === 'win32';
const shell = process.env.NEXUS_TEST_POWERSHELL || (win ? 'powershell.exe' : 'pwsh');
const pch = path.join('Intermediate', 'Build', 'Win64', 'x64', 'NexusEditor', 'Development',
  'UnrealEd', 'SharedPCH.UnrealEd.Project.ValApi.ValExpApi.Cpp20.h.dep.json');

try {
  const engine = path.join(work, 'Test engine');
  const tools = path.join(engine, 'Engine', 'Build', 'BatchFiles');
  const binaries = path.join(engine, 'Engine', 'Binaries', 'Win64');
  mkdirSync(tools, { recursive: true });
  mkdirSync(binaries, { recursive: true });
  writeFileSync(path.join(tools, '..', 'Build.version'), '{"MajorVersion":5,"MinorVersion":8,"PatchVersion":4}');
  for (const name of ['UnrealEditor.exe', 'UnrealEditor-Cmd.exe']) writeFileSync(path.join(binaries, name), '');
  const build = path.join(tools, 'Build.bat');
  writeFileSync(build, win
    ? '@echo off\r\necho TEST_UBT\r\ntype "%TEST_UBT_OUTPUT%"\r\nexit /b 6\r\n'
    : '#!/bin/sh\necho TEST_UBT\ncat "$TEST_UBT_OUTPUT"\nexit 6\n');
  chmodSync(build, 0o755);

  function run(length, errorLocation, diagnostic = '', logOnly = false) {
    const directory = path.join(work, 'p'.repeat(length - path.join(work, 'p', pch).length + 1));
    const projectFile = path.join(directory, 'Nexus.uproject');
    const script = path.join(directory, 'Tools', 'Start-Nexus.ps1');
    mkdirSync(path.dirname(script), { recursive: true });
    copyFileSync(path.join(source, 'Nexus.uproject'), projectFile);
    copyFileSync(path.join(source, 'Tools', 'Start-Nexus.ps1'), script);
    const action = path.join(directory, pch);
    assert.equal(action.length, length);
    // The sibling case also catches prefix matches without a directory separator.
    const other = path.join(directory + '-other', pch);
    const line = errorLocation === 'project' ? `[${length} characters] ${action}`
      : errorLocation === 'other' ? `[${other.length} characters] ${other}` : 'unrelated compiler failure';
    const logFile = path.join(directory, 'UBT Log.txt');
    const outputFile = path.join(directory, 'console.txt');
    const notes = ['UnrealType.h(1976,43): note: template instantiation', 'Result: Failed (OtherCompilationError)'];
    const logLines = [line, diagnostic, ...notes].filter(Boolean);
    writeFileSync(logFile, logLines.join('\n') + '\n');
    const consoleLines = logOnly ? [line, ...notes] : logLines;
    writeFileSync(outputFile, [`Log file: ${logFile}`, ...consoleLines, 'END_UBT'].join('\n') + '\n');
    const result = spawnSync(shell, ['-NoProfile', '-NonInteractive', '-File', script, '-EngineRoot', engine], {
      env: { ...process.env, TEST_UBT_OUTPUT: outputFile }, encoding: 'utf8',
    });
    if (result.error) throw result.error;
    assert.equal(result.status, 1, result.stderr);
    assert.ok(result.stdout.includes('TEST_UBT') && result.stdout.includes(line), result.stdout);
    const warning = result.stdout.indexOf('muze mit cesta');
    assert.equal(warning !== -1, length >= 260, result.stdout);
    if (warning !== -1) assert.ok(warning < result.stdout.indexOf('TEST_UBT'));
    assert.equal(result.stdout.includes('ohlasil dlouhou cestu uvnitr projektu'), errorLocation === 'project');
    assert.equal(result.stdout.includes('skoncil s kodem 6'), errorLocation !== 'project');
    const summary = result.stdout.split('END_UBT').at(-1);
    assert.equal(summary.includes('Prvni chyba sestaveni:'), Boolean(diagnostic));
    if (diagnostic) assert.ok(summary.includes(diagnostic.split('\n')[0]), summary);
  }
  run(259, 'compiler');
  run(260, 'project');
  run(261, 'project');
  run(261, 'other');
  run(259, 'compiler', 'Nexus.cpp(42,3): error C2143: syntax error\nNexus.cpp(43,2): error C2059: syntax error');
  run(259, 'compiler', 'LINK : fatal error LNK1104: cannot open file', true);
  console.log('PASS: path lengths, original output, exit status and first compiler/linker diagnostics.');
} finally {
  rmSync(work, { recursive: true, force: true });
}
