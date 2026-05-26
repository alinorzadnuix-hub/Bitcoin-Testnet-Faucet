@echo off
REM ========================================
REM Bitcoin Testnet Faucet - Quick Setup
REM ========================================

echo ========================================
echo   Bitcoin Testnet Faucet - Quick Setup
echo ========================================
echo.

REM Run PowerShell script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0setup.ps1"

REM Keep window open if there was an error
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Press any key to exit...
    pause >nul
)
