# 🚀 راهنمای Deploy روی Windows Server / VPS

## مرحله 1: آماده‌سازی سرور

### چک کنید Node.js نصب است:
```powershell
node --version
npm --version
```

اگر نصب نیست:
1. دانلود از: https://nodejs.org/
2. نصب LTS version
3. ریستارت PowerShell

---

## مرحله 2: کپی فایل‌ها به سرور

### گزینه A: اگر Desktop همان سرور است
```powershell
# فایل‌ها همینجا هستند!
cd C:\Users\Administrator\Desktop\Facet
```

### گزینه B: اگر سرور جداگانه است
1. فایل‌ها را Zip کنید
2. از طریق RDP یا FTP به سرور منتقل کنید
3. Unzip کنید در مسیر دلخواه (مثلاً `C:\inetpub\faucet`)

---

## مرحله 3: نصب Dependencies

```powershell
cd C:\Users\Administrator\Desktop\Facet
npm install
```

---

## مرحله 4: تنظیم `.env`

مطمئن شوید `.env` تنظیم شده:

```powershell
# چک کنید فایل وجود دارد
Get-Content .env

# اگر نیست، از .env.example کپی کنید
Copy-Item .env.example .env

# ویرایش کنید
notepad .env
```

**مهم:**
```env
PORT=3000
FAUCET_AMOUNT_MIN=5000
FAUCET_AMOUNT_MAX=15000
FAUCET_PRIVATE_KEY=cXXX...  # کلید شما
FAUCET_ADDRESS=mXXX...      # آدرس شما
ADMIN_USERNAME=admin
ADMIN_PASSWORD=BitcoinFaucet2025!Secure
```

---

## مرحله 5: باز کردن Port در Firewall

### روش 1: از طریق PowerShell (Admin)
```powershell
# باز کردن PowerShell به عنوان Administrator

# اجازه دسترسی به Port 3000
New-NetFirewallRule -DisplayName "Bitcoin Faucet" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

### روش 2: از طریق Windows Firewall GUI
1. کنترل پنل → Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. Port → TCP → 3000
5. Allow the connection
6. نام: "Bitcoin Faucet"

---

## مرحله 6: تست اولیه

```powershell
# اجرای موقت برای تست
node server.js
```

باز کنید در مرورگر:
- **از داخل سرور:** http://localhost:3000
- **از بیرون:** http://IP_سرور_شما:3000

اگر کار کرد، Ctrl+C بزنید و مرحله بعد!

---

## مرحله 7: اجرای دائمی با PM2

### نصب PM2:
```powershell
npm install -g pm2
npm install -g pm2-windows-service
```

### راه‌اندازی:
```powershell
# شروع فاصت با PM2
pm2 start server.js --name bitcoin-faucet

# ذخیره تنظیمات
pm2 save

# نصب به عنوان Windows Service
pm2-service-install -n PM2
```

### دستورات مفید PM2:
```powershell
pm2 status           # وضعیت
pm2 logs            # لاگ‌ها
pm2 restart bitcoin-faucet  # ریستارت
pm2 stop bitcoin-faucet     # توقف
pm2 delete bitcoin-faucet   # حذف
```

---

## مرحله 8: دسترسی از اینترنت

### روش 1: استفاده مستقیم از IP
```
http://IP_سرور:3000
```

**مثال:**
```
http://192.168.1.100:3000
```

### روش 2: استفاده از Domain

#### A) ثبت Domain Record:
در پنل دامنه خود (Namecheap, Cloudflare, etc):
```
A Record: faucet.yourdomain.com → IP_سرور
```

#### B) تنظیم Reverse Proxy با IIS (اختیاری)

**نصب URL Rewrite و ARR:**
1. دانلود URL Rewrite: https://www.iis.net/downloads/microsoft/url-rewrite
2. دانلود ARR: https://www.iis.net/downloads/microsoft/application-request-routing
3. نصب هر دو

**تنظیم IIS:**
1. باز کردن IIS Manager
2. سایت جدید بسازید یا Default را ویرایش کنید
3. URL Rewrite → Add Rule → Reverse Proxy
4. Server: `localhost:3000`
5. بله به ARR

حالا می‌توانید بدون `:3000` دسترسی داشته باشید:
```
http://yourdomain.com
```

---

## مرحله 9: امنیت (SSL/HTTPS) - پیشنهادی!

### استفاده از Cloudflare (رایگان):

1. **ثبت در Cloudflare**
   - اضافه کردن دامنه
   - تغییر Nameservers

2. **تنظیمات:**
   - SSL/TLS → Full
   - Firewall → تنظیم قوانین
   - کش → فعال

3. **دسترسی:**
```
https://yourdomain.com
```

Cloudflare به طور خودکار SSL می‌دهد! ✅

---

## مرحله 10: چک کردن همه چیز

### چک لیست:
- [ ] Node.js نصب است
- [ ] Dependencies نصب شده (`npm install`)
- [ ] فایل `.env` تنظیم شده
- [ ] Firewall Port 3000 باز است
- [ ] سرور با `node server.js` اجرا می‌شود
- [ ] از بیرون قابل دسترسی است
- [ ] PM2 نصب و راه‌اندازی شده
- [ ] (اختیاری) Domain تنظیم شده
- [ ] (اختیاری) SSL فعال است

---

## 🔧 عیب‌یابی

### مشکل: نمی‌توانم از بیرون دسترسی داشته باشم

**بررسی 1: Firewall Windows**
```powershell
Get-NetFirewallRule -DisplayName "Bitcoin Faucet"
```

**بررسی 2: Firewall سرور (VPS Provider)**
- برو به پنل VPS
- Firewall/Security Groups
- اجازه TCP Port 3000

**بررسی 3: Port در حال استفاده**
```powershell
netstat -ano | findstr :3000
```

### مشکل: بعد از ریستارت سرور، فاصت اجرا نمی‌شود

**راه حل:** PM2 را به عنوان Service نصب کنید:
```powershell
pm2 startup
pm2 save
```

### مشکل: خطای "Cannot find module"

**راه حل:**
```powershell
npm install
```

---

## 📊 مانیتورینگ

### مشاهده لاگ‌ها:
```powershell
pm2 logs bitcoin-faucet --lines 100
```

### مشاهده مصرف منابع:
```powershell
pm2 monit
```

### رفرش خودکار PM2:
```powershell
pm2 install pm2-auto-pull  # اختیاری
```

---

## 🎯 خلاصه دستورات سریع

```powershell
# 1. نصب
cd C:\path\to\Facet
npm install

# 2. تنظیم
notepad .env  # ویرایش تنظیمات

# 3. Firewall
New-NetFirewallRule -DisplayName "Bitcoin Faucet" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# 4. اجرای دائمی
npm install -g pm2
pm2 start server.js --name bitcoin-faucet
pm2 save
pm2 startup

# 5. دسترسی
# http://IP_سرور:3000
```

---

## ✅ تمام!

فاصت شما الان آنلاین است و 24/7 در دسترس مشتریان! 🎉

**لینک عمومی:** `http://IP_سرور:3000`  
**لینک ادمین:** `http://IP_سرور:3000/admin`

---

**نکته:** برای محیط production، حتماً SSL (HTTPS) اضافه کنید!
