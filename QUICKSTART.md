# 🚀 Bitcoin Testnet Wallet - Quick Setup (NO API KEY!)

## ✨ What Changed

**بدون نیاز به API!** حالا سیستم به طور کامل مستقل است:

✅ **bitcoinjs-lib** - کتابخانه اصلی Bitcoin (مثل NBitcoin)  
✅ **mempool.space API** - رایگان، بدون ثبت‌نام  
✅ **هیچ وابستگی به BlockCypher** نیست!  
✅ **امضا محلی** - کاملاً امن  

---

## 📦 نصب

### 1. نصب کتابخانه‌ها

```powershell
cd C:\Users\Administrator\Desktop\Facet
npm install
```

این کتابخانه‌ها نصب می‌شوند:
- `bitcoinjs-lib` - برای ساخت و امضای تراکنش
- `ecpair` - برای مدیریت کلیدهای خصوصی
- `tiny-secp256k1` - کتابخانه رمزنگاری

### 2. تنظیم `.env`

```powershell
copy .env.example .env
notepad .env
```

فقط کیف پول خودتان را تنظیم کنید (دیگر نیازی به API key نیست!):

```env
PORT=3000

# NO API KEY REQUIRED!

# Your testnet wallet
FAUCET_PRIVATE_KEY=cXXX...your_private_key...XXX
FAUCET_ADDRESS=mXXX...your_address...XXX
FAUCET_AMOUNT=10000

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. اجرا

```powershell
node server.js
```

یا دابل کلیک روی `start.bat`

---

## 🎯 مزایای جدید

| قبل (BlockCypher) | حالا (Native) |
|------------------|---------------|
| ❌ نیاز به API key | ✅ بدون API key |
| ❌ محدودیت درخواست | ✅ بدون محدودیت |
| ❌ وابسته به سرویس | ✅ کاملاً مستقل |
| ⚠️ امضا در سرور | ✅ امضا محلی |
| 💰 رایگان (با محدودیت) | ✅ رایگان (بدون محدودیت) |

---

## 🔧 چگونه کار می‌کند؟

### ساخت تراکنش (Native)

```
1. دریافت UTXOs از mempool.space
2. انتخاب UTXOهای کافی
3. ساخت تراکنش با bitcoinjs-lib
4. امضای محلی با کلید خصوصی شما
5. ارسال به شبکه Bitcoin از طریق mempool.space
```

همه چیز روی سرور شما انجام می‌شود - بدون ارسال کلید خصوصی به هیچ جا!

---

## 📝 فایل‌های جدید

### [bitcoin-wallet.js](file:///c:/Users/Administrator/Desktop/Facet/bitcoin-wallet.js)
کلاس اصلی کیف پول با قابلیت‌های:
- ساخت و امضای تراکنش
- دریافت UTXO و موجودی
- ارسال Bitcoin
- اسکن واریزها
- اعتبارسنجی آدرس

---

## 🌐 API های استفاده شده

همه از **mempool.space** (رایگان):

- `GET /address/{address}/utxo` - دریافت UTXOها
- `GET /address/{address}` - چک موجودی
- `GET /tx/{txid}/hex` - دریافت تراکنش
- `POST /tx` - ارسال تراکنش
- `GET /address/{address}/txs` - تاریخچه تراکنش‌ها

**هیچ API key لازم نیست!**

---

## ✅ تست

بعد از اجرا:

1. برو به: `http://localhost:3000/admin`
2. لاگین کن
3. از قسمت "Send Bitcoin" استفاده کن
4. ✅ همه چیز محلی انجام می‌شود!

---

## 🔒 امنیت

✅ کلید خصوصی شما هرگز از سرور خارج نمی‌شود  
✅ امضا به صورت محلی انجام می‌شود  
✅ فقط تراکنش امضا شده ارسال می‌شود  
✅ نیازی به اعتماد به سرویس شخص ثالث نیست  

---

**الان کاملاً مستقل هستید!** 🎉
