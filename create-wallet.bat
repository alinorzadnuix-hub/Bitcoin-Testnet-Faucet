@echo off
chcp 65001 >nul
cls
echo ════════════════════════════════════════════════════════════
echo  🔐 ساخت کیف پول بیت‌کوین تستنت
echo  Bitcoin Testnet Wallet Generator
echo ════════════════════════════════════════════════════════════
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ خطا: Node.js نصب نیست!
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo لطفاً از https://nodejs.org نصب کنید
    echo Please install from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js پیدا شد
echo ✅ Node.js found
echo.

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo 📦 نصب کتابخانه‌ها...
    echo 📦 Installing libraries...
    echo.
    echo این ممکن است چند دقیقه طول بکشد...
    echo This may take a few minutes...
    echo.
    
    call npm install
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ خطا در نصب کتابخانه‌ها!
        echo ❌ Failed to install libraries!
        echo.
        pause
        exit /b 1
    )
    
    echo.
    echo ✅ کتابخانه‌ها نصب شدند!
    echo ✅ Libraries installed!
    echo.
)

echo ⏳ در حال ساخت کیف پول جدید...
echo ⏳ Generating new wallet...
echo.

REM Generate wallet and save to file
node generate-wallet.js 2>&1 | tee wallet-info.txt

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ خطا در ساخت کیف پول!
    echo ❌ Error generating wallet!
    echo.
    echo لطفاً بررسی کنید که تمام فایل‌ها موجود باشند.
    echo Please check that all files exist.
    echo.
    pause
    exit /b 1
)

echo.
echo ════════════════════════════════════════════════════════════
echo  ✅ کیف پول ساخته شد!
echo  ✅ Wallet Created Successfully!
echo ════════════════════════════════════════════════════════════
echo.

REM Check if wallet-info.txt has content
for %%A in (wallet-info.txt) do set size=%%~zA
if %size% LSS 100 (
    echo ❌ خطا: فایل اطلاعات خالی است!
    echo ❌ Error: Wallet info file is empty!
    echo.
    echo در حال تلاش مجدد...
    echo Trying again...
    echo.
    
    REM Try running directly and show output
    node generate-wallet.js
    
    echo.
    pause
    exit /b 1
)

echo.
echo 📄 اطلاعات کیف پول شما:
echo 📄 Your wallet information:
echo.
type wallet-info.txt
echo.

echo ════════════════════════════════════════════════════════════
echo  📝 مهم! اطلاعات در wallet-info.txt ذخیره شد
echo  📝 Important! Information saved to wallet-info.txt
echo ════════════════════════════════════════════════════════════
echo.
echo.

REM Extract private key and address for easier setup
echo 🔍 استخراج اطلاعات مهم...
echo 🔍 Extracting important information...
echo.

REM Parse the file to get private key and address
for /f "tokens=*" %%a in ('findstr /C:"Private Key (WIF" wallet-info.txt') do set line1=%%a
for /f "tokens=*" %%a in ('findstr /C:"Bitcoin Testnet Address:" wallet-info.txt') do set line2=%%a

echo ════════════════════════════════════════════════════════════
echo  📋 کپی کنید این اطلاعات را:
echo  📋 COPY THESE VALUES:
echo ════════════════════════════════════════════════════════════
echo.

REM Show extracted info with better formatting
findstr /C:"Private Key (WIF" wallet-info.txt
echo.
findstr /C:"Bitcoin Testnet Address:" wallet-info.txt
echo.
echo ════════════════════════════════════════════════════════════
echo.

echo آیا می‌خواهید الان فایل .env را باز کنید؟
echo Do you want to open .env file now?
echo.
choice /C YN /N /M "بله (Y) / خیر (N): "

if errorlevel 2 (
    echo.
    echo باشه! بعداً فایل .env را باز کنید و این مقادیر را وارد کنید:
    echo OK! Open .env file later and enter these values:
    echo.
    echo 1. فایل .env را باز کنید
    echo 2. خط FAUCET_PRIVATE_KEY را پیدا کنید
    echo 3. Private Key را از wallet-info.txt کپی کنید
    echo 4. همینکار را برای FAUCET_ADDRESS انجام دهید
    echo.
    pause
    exit /b 0
)

echo.
echo 📂 باز کردن فایل .env ...
echo 📂 Opening .env file...
echo.

if not exist ".env" (
    copy .env.example .env >nul
)

timeout /t 1 >nul

echo ════════════════════════════════════════════════════════════
echo  📝 راهنمای ویرایش .env:
echo  📝 .env Editing Guide:
echo ════════════════════════════════════════════════════════════
echo.
echo در فایل .env این خطوط را پیدا کنید:
echo Find these lines in .env:
echo.
echo   FAUCET_PRIVATE_KEY=cXXX...
echo   FAUCET_ADDRESS=mXXX...
echo.
echo و با اطلاعاتی که در بالا نمایش داده شد جایگزین کنید.
echo Replace them with the information shown above.
echo.
echo بعد از ویرایش، SAVE کنید و فایل را ببندید.
echo After editing, SAVE and close the file.
echo.
pause

notepad .env

echo.
echo ════════════════════════════════════════════════════════════
echo  ✅ تمام شد!
echo  ✅ Done!
echo ════════════════════════════════════════════════════════════
echo.
echo حالا می‌توانید start.bat را اجرا کنید!
echo Now you can run start.bat!
echo.
pause
