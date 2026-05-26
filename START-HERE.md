# 🎯 راهنمای گام به گام - ساخت کیف پول

## ⚡ روش آسان (فقط 1 کلیک!)

### مرحله 1: دابل کلیک روی `create-wallet.bat`

```
📂 Facet
   ├── create-wallet.bat  ← این فایل را دابل کلیک کنید!
   ├── start.bat
   └── ...
```

### مرحله 2: منتظر بمانید

اسکریپت کیف پول را می‌سازد و نمایش می‌دهد:

```
═══════════════════════════════════════════════════════
  🪙  Bitcoin Testnet Wallet Generator
═══════════════════════════════════════════════════════

✅ Wallet Generated Successfully!

📍 Bitcoin Testnet Address:
   mxVwBcRgzLoTJAV7h3kPjSEFPp6C8Q1234

🔑 Private Key (WIF format):
   cT3cU6yF8Pz9x2zEnM5uTiXujVzBxE9v...
```

### مرحله 3: اطلاعات ذخیره شد!

اطلاعات کیف پول شما در فایل `wallet-info.txt` ذخیره شد.

### مرحله 4: وقتی پرسید، Y بزنید

```
آیا می‌خواهید الان فایل .env را باز کنید؟
بله (Y) / خیر (N): Y
```

### مرحله 5: نوت‌پد باز می‌شود

فایل `.env` باز می‌شود. این خطوط را پیدا کنید:

```env
# Your testnet wallet
FAUCET_PRIVATE_KEY=cXXX...your_private_key...XXX
FAUCET_ADDRESS=mXXX...your_address...XXX
```

### مرحله 6: اطلاعات را کپی کنید

از فایل `wallet-info.txt` یا از ترمینال:

**قبل از تغییر:**
```env
FAUCET_PRIVATE_KEY=cXXX...your_private_key...XXX
FAUCET_ADDRESS=mXXX...your_address...XXX
```

**بعد از تغییر:**
```env
FAUCET_PRIVATE_KEY=cT3cU6yF8Pz9x2zEnM5uTiXujVzBxE9v...
FAUCET_ADDRESS=mxVwBcRgzLoTJAV7h3kPjSEFPp6C8Q1234
```

### مرحله 7: Save کنید

در نوت‌پد:
1. **File** → **Save** (یا Ctrl+S)
2. نوت‌پد را ببندید

### مرحله 8: اجرا کنید!

حالا `start.bat` را دابل کلیک کنید و سرور اجرا می‌شود!

---

## 📋 خلاصه:

```
1. دابل کلیک create-wallet.bat
2. منتظر بمانید (کیف پول ساخته می‌شود)
3. Y بزنید
4. Private Key و Address را کپی کنید
5. در .env جایگذاری کنید
6. Save کنید
7. start.bat را اجرا کنید
```

---

## ❓ اگر اشتباه کردید؟

### فایل wallet-info.txt را گم کردید؟
- فقط دوباره `create-wallet.bat` را اجرا کنید
- یک کیف پول جدید می‌سازد

### نمی‌دانید کجا کپی کنید؟
نگاه کنید به این مثال:

**از اینجا کپی کنید** (wallet-info.txt):
```
🔑 Private Key (WIF format):
   cT3cU6yF8Pz9x2zEnM5uTiXujVzBxE9v...
   
📍 Bitcoin Testnet Address:
   mxVwBcRgzLoTJAV7h3kPjSEFPp6C8Q1234
```

**به اینجا بچسبانید** (.env):
```env
FAUCET_PRIVATE_KEY=cT3cU6yF8Pz9x2zEnM5uTiXujVzBxE9v...
FAUCET_ADDRESS=mxVwBcRgzLoTJAV7h3kPjSEFPp6C8Q1234
```

---

## ⚠️ نکات مهم:

1. **Private Key را نگه دارید** - اگر گم شود، دسترسی به کیف پول را از دست می‌دهید
2. **این تستنت است** - این کوین‌ها ارزش واقعی ندارند
3. **فایل wallet-info.txt را پاک نکنید** - ممکن است بعداً نیاز داشته باشید

---

**همین!** 🎉 دیگر سخت نیست!
