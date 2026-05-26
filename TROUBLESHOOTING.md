# 🆘 اگر فایل wallet-info.txt خالی بود

## روش آسان‌تر - دستی ساخت کیف پول:

### مرحله 1: باز کردن PowerShell

1. کلیک راست روی پوشه `Facet`
2. انتخاب "Open in Terminal" یا "Open PowerShell here"

### مرحله 2: اجرای دستورات

```powershell
# نصب کتابخانه‌ها (فقط بار اول)
npm install

# ساخت کیف پول
node generate-wallet.js
```

### مرحله 3: کپی اطلاعات

شما چیزی شبیه این خواهید دید:

```
═══════════════════════════════════════════════════════
  🪙  Bitcoin Testnet Wallet Generator
═══════════════════════════════════════════════════════

✅ Wallet Generated Successfully!

═══════════════════════════════════════════════════════
  SAVE THIS INFORMATION SECURELY!
═══════════════════════════════════════════════════════

📍 Bitcoin Testnet Address:
   mxVwBcRgzLoTJAV7h3kPjSEFPp6C8Q1234

🔑 Private Key (WIF format):
   cT3cU6yF8Pz9x2zEnM5uTiXujVzBxE9v7Kn8...

🔐 Private Key (HEX format):
   a1b2c3d4e5f6...

📢 Public Key (Compressed):
   02a1b2c3...
```

### مرحله 4: کپی کنید این 2 خط:

**Private Key (WIF):**
```
cT3cU6yF8Pz9x2zEnM5uTiXujVzBxE9v7Kn8...
```

**Address:**
```
mxVwBcRgzLoTJAV7h3kPjSEFPp6C8Q1234
```

### مرحله 5: باز کردن .env

```powershell
notepad .env
```

### مرحله 6: جایگذاری اطلاعات

پیدا کنید این خطوط:

```env
# Your testnet wallet
FAUCET_PRIVATE_KEY=cXXX...your_private_key...XXX
FAUCET_ADDRESS=mXXX...your_address...XXX
```

تغییر دهید به:

```env
# Your testnet wallet
FAUCET_PRIVATE_KEY=cT3cU6yF8Pz9x2zEnM5uTiXujVzBxE9v7Kn8...
FAUCET_ADDRESS=mxVwBcRgzLoTJAV7h3kPjSEFPp6C8Q1234
```

### مرحله 7: Save کنید

در نوت‌پد:
- File → Save (یا Ctrl+S)

---

## ✅ تمام!

حالا `start.bat` را اجرا کنید:

```powershell
.\start.bat
```

یا دابل کلیک روی `start.bat`

---

## 🎬 ویدیوی آموزشی (تصویری)

### کپی اطلاعات از ترمینال:

```
1. بعد از node generate-wallet.js
2. ببینید خطوط Private Key و Address
3. کلیک کنید و انتخاب کنید (drag mouse)
4. کلیک راست → Copy
5. توی .env بچسبانید
```

### نمونه دقیق:

**قبل:**
```env
FAUCET_PRIVATE_KEY=cXXX...your_private_key...XXX
```

**بعد:**
```env
FAUCET_PRIVATE_KEY=cT3cU6yF8Pz9x2zEnM5uTiXujVzBxE9v7Kn8M3pQ2rS1t
```

---

## ❓ همچنان مشکل دارید?

اگر باز هم کار نکرد:

1. اطمینان حاصل کنید Node.js نصب است: `node --version`
2. پوشه `node_modules` وجود دارد؟
3. فایل `generate-wallet.js` وجود دارد؟

اگر نه، دوباره `npm install` را اجرا کنید.

---

**نکته:** فایل `.bat` ممکن است در برخی سیستم‌ها مشکل داشته باشد. روش PowerShell همیشه کار می‌کند! ✅
