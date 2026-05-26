@echo off
chcp 65001 >nul
echo ═══════════════════════════════════════════════════════
echo  🪙  Bitcoin Testnet Faucet - Auto Setup
echo ═══════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and install it.
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    echo This may take a few minutes...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed successfully!
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo ⚙️  Setting up .env file...
    copy .env.example .env >nul
    echo ✅ .env file created!
    echo.
)

REM Check if wallet is configured
findstr /C:"FAUCET_PRIVATE_KEY=cXXX" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ═══════════════════════════════════════════════════════
    echo  🔑 WALLET NOT CONFIGURED!
    echo ═══════════════════════════════════════════════════════
    echo.
    echo You need to generate a Bitcoin testnet wallet first.
    echo.
    echo Do you want to generate a new wallet now? (Y/N)
    choice /C YN /N /M "Press Y to generate wallet, N to skip: "
    
    if errorlevel 2 (
        echo.
        echo ⚠️  Skipping wallet generation.
        echo.
        echo You need to:
        echo 1. Run: node generate-wallet.js
        echo 2. Copy the Private Key (WIF format)
        echo 3. Edit .env file and set FAUCET_PRIVATE_KEY
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo ════════════════════════════════════════════════════════
    echo  🔐 GENERATING NEW WALLET...
    echo ════════════════════════════════════════════════════════
    echo.
    
    node generate-wallet.js
    
    echo.
    echo ════════════════════════════════════════════════════════
    echo  📝 PLEASE COPY YOUR WALLET INFO
    echo ════════════════════════════════════════════════════════
    echo.
    echo 1. Copy the Private Key (WIF format) - starts with 'c'
    echo 2. Copy the Address (starts with 'm' or 'n')
    echo 3. Press any key when ready to edit .env file...
    pause >nul
    
    echo.
    echo Opening .env file in notepad...
    echo.
    echo Replace these lines:
    echo   FAUCET_PRIVATE_KEY=cXXX...
    echo   FAUCET_ADDRESS=mXXX...
    echo.
    echo With your wallet information, then SAVE and close notepad.
    echo.
    timeout /t 3 >nul
    
    notepad .env
    
    echo.
    echo ✅ Configuration saved!
    echo.
)

REM Final check
findstr /C:"FAUCET_PRIVATE_KEY=cXXX" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ❌ ERROR: Wallet still not configured!
    echo Please edit .env file and set your wallet information.
    echo.
    pause
    exit /b 1
)

echo ═══════════════════════════════════════════════════════
echo  🚀 Starting server...
echo ═══════════════════════════════════════════════════════
echo.

REM Start the server
node server.js

REM Keep window open if server crashes
echo.
echo ═══════════════════════════════════════════════════════
echo Server stopped.
echo ═══════════════════════════════════════════════════════
pause
