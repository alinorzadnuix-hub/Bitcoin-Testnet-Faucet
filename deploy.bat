@echo off
chcp 65001 >nul
cls
echo ════════════════════════════════════════════════════════════
echo  🚀 Bitcoin Faucet - Production Deployment Script
echo ════════════════════════════════════════════════════════════
echo.

REM Check admin privileges
net session >nul 2>&1
if %errorLevel% NEQ 0 (
    echo ❌ این اسکریپت نیاز به دسترسی Administrator دارد!
    echo.
    echo کلیک راست روی فایل → "Run as administrator"
    echo.
    pause
    exit /b 1
)

echo ✅ دسترسی Administrator تایید شد
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js نصب نیست!
    echo.
    echo لطفاً از https://nodejs.org نصب کنید
    pause
    exit /b 1
)

echo ✅ Node.js پیدا شد
node --version
echo.

REM Install dependencies if not exists
if not exist "node_modules\" (
    echo 📦 نصب dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ خطا در نصب dependencies!
        pause
        exit /b 1
    )
    echo ✅ Dependencies نصب شد
    echo.
)

REM Check .env file
if not exist ".env" (
    echo ⚠️ فایل .env پیدا نشد!
    echo.
    echo آیا می‌خواهید از .env.example کپی کنید؟
    choice /C YN /N /M "بله (Y) / خیر (N): "
    
    if errorlevel 2 (
        echo.
        echo لطفاً فایل .env را ایجاد کنید
        pause
        exit /b 1
    )
    
    copy .env.example .env >nul
    echo ✅ فایل .env ایجاد شد
    echo.
    echo لطفاً فایل .env را ویرایش کنید:
    notepad .env
    echo.
)

echo ════════════════════════════════════════════════════════════
echo  🔥 تنظیم Firewall
echo ════════════════════════════════════════════════════════════
echo.

REM Add firewall rule
netsh advfirewall firewall show rule name="Bitcoin Faucet" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo اضافه کردن قانون Firewall...
    netsh advfirewall firewall add rule name="Bitcoin Faucet" dir=in action=allow protocol=TCP localport=3000
    echo ✅ Port 3000 در Firewall باز شد
) else (
    echo ✅ قانون Firewall از قبل وجود دارد
)
echo.

echo ════════════════════════════════════════════════════════════
echo  📦 نصب PM2 (Process Manager)
echo ════════════════════════════════════════════════════════════
echo.

where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo نصب PM2...
    call npm install -g pm2
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ خطا در نصب PM2!
        pause
        exit /b 1
    )
    echo ✅ PM2 نصب شد
) else (
    echo ✅ PM2 از قبل نصب است
)
echo.

echo ════════════════════════════════════════════════════════════
echo  🚀 راه‌اندازی Faucet
echo ════════════════════════════════════════════════════════════
echo.

REM Stop existing instance
pm2 stop bitcoin-faucet >nul 2>&1
pm2 delete bitcoin-faucet >nul 2>&1

echo شروع سرور با PM2...
pm2 start server.js --name bitcoin-faucet
echo.

echo ذخیره تنظیمات PM2...
pm2 save
echo.

echo ════════════════════════════════════════════════════════════
echo  ✅ راه‌اندازی موفقیت‌آمیز!
echo ════════════════════════════════════════════════════════════
echo.
echo سرور شما الان در حال اجراست!
echo.

REM Get IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4"') do set IP=%%a
set IP=%IP:~1%

echo 🌐 دسترسی به Faucet:
echo.
echo    صفحه عمومی:  http://localhost:3000
echo    پنل ادمین:    http://localhost:3000/admin
echo.
echo 🌍 دسترسی از اینترنت:
echo.
echo    صفحه عمومی:  http://%IP%:3000
echo    پنل ادمین:    http://%IP%:3000/admin
echo.
echo ════════════════════════════════════════════════════════════
echo  📊 دستورات مفید:
echo ════════════════════════════════════════════════════════════
echo.
echo    pm2 status              وضعیت سرور
echo    pm2 logs               مشاهده لاگ‌ها
echo    pm2 restart bitcoin-faucet    ریستارت
echo    pm2 stop bitcoin-faucet       توقف
echo    pm2 monit              مانیتورینگ
echo.
echo ════════════════════════════════════════════════════════════
echo.

REM Show status
echo وضعیت فعلی:
pm2 status

echo.
echo ⚠️ نکات مهم:
echo.
echo 1. مطمئن شوید Firewall سرور/VPS شما Port 3000 را باز کرده
echo 2. برای امنیت بیشتر، از Reverse Proxy استفاده کنید
echo 3. برای HTTPS، از Cloudflare یا Let's Encrypt استفاده کنید
echo.
pause
