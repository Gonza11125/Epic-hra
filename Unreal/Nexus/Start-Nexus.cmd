@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Tools\Start-Nexus.ps1" %*
if errorlevel 1 pause
