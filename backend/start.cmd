@echo off
setlocal

REM Thin wrapper that delegates to PowerShell to avoid cmd.exe Unicode/encoding pitfalls.
set "SCRIPT_DIR=%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%start.ps1"
exit /b %errorlevel%

