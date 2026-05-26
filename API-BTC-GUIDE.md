# 📚 راهنمای استفاده از API - پشتیبانی از BTC و Satoshi

## ✨ قابلیت جدید: ارسال مقدار به دو فرمت

API حالا **دو فرمت** را پشتیبانی می‌کند:

1. **Satoshi** (عدد صحیح): مثل `10000`
2. **BTC** (اعشاری): مثل `0.001`

### تبدیل خودکار
- ✅ `0.001` → `100,000 satoshi`
- ✅ `0.0001` → `10,000 satoshi`
- ✅ `0.00001` → `1,000 satoshi`
- ✅ `25000` → `25,000 satoshi` (بدون تغییر)

---

## 📊 جدول تبدیل سریع

| BTC | Satoshi |
|-----|---------|
| 0.00001 | 1,000 |
| 0.0001 | 10,000 |
| 0.0005 | 50,000 |
| 0.001 | 100,000 |
| 0.01 | 1,000,000 |

---

## 🚀 نحوه استفاده

### API Endpoint
```
POST /api/send
```

### درخواست با BTC
```json
{
  "address": "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
  "amount": 0.001
}
```

### درخواست با Satoshi
```json
{
  "address": "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
  "amount": 100000
}
```

**هر دو درخواست بالا یکسان هستند!**

---

## 💻 مثال‌های کد

### PowerShell - ارسال با فرمت BTC
```powershell
# ارسال 0.001 BTC
$body = @{
    address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"
    amount = 0.001
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/send" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

Write-Host "✅ Sent $($response.amount) satoshis"
Write-Host "   Equivalent to $('{0:N8}' -f ($response.amount / 100000000)) BTC"
Write-Host "   TX: $($response.txHash)"
```

### PowerShell - ارسال با Satoshi
```powershell
# ارسال 25,000 satoshis
$body = @{
    address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"
    amount = 25000
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:3000/api/send" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"
```

### Python - ارسال با BTC
```python
import requests

url = "http://localhost:3000/api/send"

# ارسال 0.001 BTC
data = {
    "address": "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
    "amount": 0.001
}

response = requests.post(url, json=data)
result = response.json()

if result['success']:
    satoshis = result['amount']
    btc = satoshis / 100000000
    
    print(f"✅ Sent {satoshis:,} satoshis")
    print(f"   Equivalent to {btc:.8f} BTC")
    print(f"   TX: {result['txHash']}")
```

### Python - کلاس با پشتیبانی BTC
```python
import requests

class BitcoinFaucetClient:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
    
    def send_btc(self, address: str, btc_amount: float):
        """ارسال مقدار به BTC"""
        return self._send(address, btc_amount)
    
    def send_satoshi(self, address: str, satoshi_amount: int):
        """ارسال مقدار به satoshi"""
        return self._send(address, satoshi_amount)
    
    def _send(self, address: str, amount):
        url = f"{self.base_url}/api/send"
        data = {
            "address": address,
            "amount": amount
        }
        
        response = requests.post(url, json=data)
        return response.json()

# استفاده
client = BitcoinFaucetClient()

# ارسال با BTC
result = client.send_btc("tb1q...", 0.001)

# ارسال با satoshi
result = client.send_satoshi("tb1q...", 100000)
```

### JavaScript (Node.js) - ارسال با BTC
```javascript
const axios = require('axios');

async function sendBTC(address, btcAmount) {
    try {
        const response = await axios.post('http://localhost:3000/api/send', {
            address: address,
            amount: btcAmount  // مثل 0.001
        });
        
        const satoshis = response.data.amount;
        const btc = (satoshis / 100000000).toFixed(8);
        
        console.log(`✅ Sent ${satoshis.toLocaleString()} satoshis`);
        console.log(`   Equivalent to ${btc} BTC`);
        console.log(`   TX: ${response.data.txHash}`);
        
        return response.data;
    } catch (error) {
        console.error('Error:', error.response.data.error);
    }
}

// ارسال 0.001 BTC
sendBTC('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', 0.001);

// ارسال 0.0005 BTC
sendBTC('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', 0.0005);
```

### C# - ارسال با BTC
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class BitcoinFaucetClient
{
    private readonly HttpClient _client = new HttpClient();
    private readonly string _baseUrl;
    
    public BitcoinFaucetClient(string baseUrl = "http://localhost:3000")
    {
        _baseUrl = baseUrl;
    }
    
    // ارسال با BTC
    public async Task<Response> SendBTC(string address, decimal btcAmount)
    {
        return await Send(address, btcAmount);
    }
    
    // ارسال با Satoshi
    public async Task<Response> SendSatoshi(string address, long satoshiAmount)
    {
        return await Send(address, satoshiAmount);
    }
    
    private async Task<Response> Send(string address, object amount)
    {
        var requestBody = new
        {
            address = address,
            amount = amount
        };
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await _client.PostAsync($"{_baseUrl}/api/send", content);
        var responseString = await response.Content.ReadAsStringAsync();
        
        return JsonSerializer.Deserialize<Response>(responseString);
    }
    
    public class Response
    {
        public bool success { get; set; }
        public string txHash { get; set; }
        public long amount { get; set; }
        public int fee { get; set; }
        public string error { get; set; }
        
        public decimal AmountInBTC => amount / 100000000m;
    }
}

// استفاده
class Program
{
    static async Task Main()
    {
        var client = new BitcoinFaucetClient();
        
        string address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";
        
        // ارسال 0.001 BTC
        var result = await client.SendBTC(address, 0.001m);
        
        if (result.success)
        {
            Console.WriteLine($"✅ Sent {result.amount:N0} satoshis");
            Console.WriteLine($"   Equivalent to {result.AmountInBTC:F8} BTC");
            Console.WriteLine($"   TX: {result.txHash}");
        }
    }
}
```

### cURL - ارسال با BTC
```bash
# ارسال 0.001 BTC
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"address":"tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx","amount":0.001}'

# ارسال 0.0005 BTC
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"address":"tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx","amount":0.0005}'
```

---

## 🧮 تابع Helper برای تبدیل

### PowerShell
```powershell
function ConvertTo-Satoshi {
    param([decimal]$BTC)
    return [long]($BTC * 100000000)
}

function ConvertTo-BTC {
    param([long]$Satoshi)
    return $Satoshi / 100000000
}

# استفاده
$satoshis = ConvertTo-Satoshi -BTC 0.001  # 100000
$btc = ConvertTo-BTC -Satoshi 100000       # 0.001
```

### Python
```python
def btc_to_satoshi(btc: float) -> int:
    """تبدیل BTC به satoshi"""
    return int(btc * 100_000_000)

def satoshi_to_btc(satoshi: int) -> float:
    """تبدیل satoshi به BTC"""
    return satoshi / 100_000_000

# استفاده
sats = btc_to_satoshi(0.001)  # 100000
btc = satoshi_to_btc(100000)   # 0.001
```

### JavaScript
```javascript
function btcToSatoshi(btc) {
    return Math.floor(btc * 100000000);
}

function satoshiToBTC(satoshi) {
    return satoshi / 100000000;
}

// استفاده
const sats = btcToSatoshi(0.001);  // 100000
const btc = satoshiToBTC(100000);   // 0.001
```

---

## 📝 Response Format

پاسخ همیشه مقدار را به **satoshi** برمی‌گرداند:

```json
{
  "success": true,
  "message": "Funds sent successfully!",
  "txHash": "a1b2c3...",
  "amount": 100000,
  "fee": 141,
  "explorerUrl": "https://mempool.space/testnet/tx/..."
}
```

برای تبدیل به BTC:
```javascript
const btc = response.amount / 100000000;  // 0.001
```

---

## ⚙️ محدودیت‌ها (اختیاری)

در حال حاضر محدودیت‌ها:
- **حداقل**: 1,000 satoshi (0.00001 BTC)
- **حداکثر**: 50,000 satoshi (0.0005 BTC)

برای حذف محدودیت، در `server.js` خطوط مربوط به min/max را کامنت کنید.

---

## ✅ مثال کامل - ارسال چند مقدار

### PowerShell
```powershell
# لیست مقادیر مختلف (BTC)
$amounts = @(0.0001, 0.0005, 0.001, 0.002)
$address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"

foreach ($amount in $amounts) {
    Write-Host "`nSending $amount BTC..." -ForegroundColor Cyan
    
    $body = @{
        address = $address
        amount = $amount
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod `
            -Uri "http://localhost:3000/api/send" `
            -Method Post `
            -Body $body `
            -ContentType "application/json"
        
        $btc = $response.amount / 100000000
        Write-Host "  ✅ Success!" -ForegroundColor Green
        Write-Host "     Sent: $($response.amount) satoshis ($btc BTC)" -ForegroundColor Gray
        Write-Host "     TX: $($response.txHash.Substring(0,16))..." -ForegroundColor Gray
    }
    catch {
        Write-Host "  ❌ Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    
    Start-Sleep -Seconds 1
}
```

### Python
```python
import requests
import time

amounts_btc = [0.0001, 0.0005, 0.001, 0.002]
address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"

for amount in amounts_btc:
    print(f"\nSending {amount} BTC...")
    
    response = requests.post('http://localhost:3000/api/send', json={
        'address': address,
        'amount': amount
    })
    
    result = response.json()
    
    if result['success']:
        satoshis = result['amount']
        btc = satoshis / 100_000_000
        print(f"  ✅ Success!")
        print(f"     Sent: {satoshis:,} satoshis ({btc:.8f} BTC)")
        print(f"     TX: {result['txHash'][:16]}...")
    else:
        print(f"  ❌ Error: {result['error']}")
    
    time.sleep(1)
```

---

## 🎯 خلاصه

| فرمت | مثال | نتیجه (satoshi) |
|------|------|----------------|
| BTC اعشاری | `0.001` | 100,000 |
| BTC اعشاری | `0.0005` | 50,000 |
| Satoshi صحیح | `25000` | 25,000 |
| Satoshi صحیح | `100000` | 100,000 |

**✅ هر دو فرمت پشتیبانی می‌شوند - انتخاب با شماست!**
