# 📚 راهنمای کامل استفاده از API

## 🎯 معرفی

این سیستم **2 API اصلی** دارد که می‌توانید از آن‌ها برای ارسال Bitcoin testnet استفاده کنید:

| API | آدرس | کاربرد |
|-----|------|--------|
| **Claim API** | `POST /api/claim` | دریافت مقدار ثابت/تصادفی Bitcoin |
| **Send API** | `POST /api/send` | ارسال مقدار دلخواه Bitcoin (1000-50000 satoshi) |

**ویژگی‌ها:**
- ✅ بدون نیاز به احراز هویت
- ✅ بدون محدودیت تعداد درخواست
- ✅ بدون محدودیت زمانی
- ✅ پاسخ JSON ساده و واضح

---

## 🌐 اطلاعات پایه

### Base URL
```
http://localhost:3000
```

اگر سرور را روی پورت دیگری اجرا کردید، آدرس را تغییر دهید:
```
http://localhost:PORT
```

### Content-Type
تمام درخواست‌ها باید با `Content-Type: application/json` ارسال شوند.

---

## 📡 API #1: Claim (دریافت مقدار ثابت/تصادفی)

### اطلاعات
- **URL**: `POST /api/claim`
- **نیاز به احراز هویت**: خیر
- **محدودیت**: هیچ

### Request Body
```json
{
  "address": "Bitcoin testnet address"
}
```

### Response (موفق - 200 OK)
```json
{
  "success": true,
  "message": "Funds sent successfully!",
  "txHash": "a1b2c3d4e5f6...",
  "amount": 10000,
  "fee": 141,
  "explorerUrl": "https://mempool.space/testnet/tx/..."
}
```

### Response (خطا - 400/500)
```json
{
  "success": false,
  "error": "توضیح خطا"
}
```

### مثال PowerShell
```powershell
$body = @{
    address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/claim" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

Write-Host "Transaction: $($response.txHash)"
Write-Host "Amount: $($response.amount) satoshis"
```

### مثال Python
```python
import requests

url = "http://localhost:3000/api/claim"
data = {
    "address": "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"
}

response = requests.post(url, json=data)
result = response.json()

if result['success']:
    print(f"Transaction: {result['txHash']}")
    print(f"Amount: {result['amount']} satoshis")
else:
    print(f"Error: {result['error']}")
```

### مثال JavaScript (Node.js)
```javascript
const axios = require('axios');

async function claimBitcoin(address) {
    try {
        const response = await axios.post('http://localhost:3000/api/claim', {
            address: address
        });
        
        console.log('Transaction:', response.data.txHash);
        console.log('Amount:', response.data.amount, 'satoshis');
        return response.data;
    } catch (error) {
        console.error('Error:', error.response.data.error);
    }
}

claimBitcoin('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx');
```

### مثال C#
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class FaucetClient
{
    private static readonly HttpClient client = new HttpClient();
    
    public static async Task<string> ClaimBitcoin(string address)
    {
        var requestBody = new
        {
            address = address
        };
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await client.PostAsync(
            "http://localhost:3000/api/claim",
            content
        );
        
        var responseString = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseString);
        
        if (result.GetProperty("success").GetBoolean())
        {
            var txHash = result.GetProperty("txHash").GetString();
            var amount = result.GetProperty("amount").GetInt32();
            
            Console.WriteLine($"Transaction: {txHash}");
            Console.WriteLine($"Amount: {amount} satoshis");
            
            return txHash;
        }
        else
        {
            var error = result.GetProperty("error").GetString();
            Console.WriteLine($"Error: {error}");
            return null;
        }
    }
    
    static async Task Main()
    {
        await ClaimBitcoin("tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx");
    }
}
```

### مثال PHP
```php
<?php
function claimBitcoin($address) {
    $url = 'http://localhost:3000/api/claim';
    
    $data = array('address' => $address);
    $json = json_encode($data);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($result['success']) {
        echo "Transaction: " . $result['txHash'] . "\n";
        echo "Amount: " . $result['amount'] . " satoshis\n";
        return $result['txHash'];
    } else {
        echo "Error: " . $result['error'] . "\n";
        return null;
    }
}

claimBitcoin('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx');
?>
```

---

## 📡 API #2: Send (ارسال مقدار دلخواه)

### اطلاعات
- **URL**: `POST /api/send`
- **نیاز به احراز هویت**: خیر
- **محدودیت**: هیچ
- **محدودیت مقدار**: 1,000 - 50,000 satoshi

### Request Body
```json
{
  "address": "Bitcoin testnet address",
  "amount": 15000
}
```

### Response (موفق - 200 OK)
```json
{
  "success": true,
  "message": "Funds sent successfully!",
  "txHash": "a1b2c3d4e5f6...",
  "amount": 15000,
  "fee": 141,
  "explorerUrl": "https://mempool.space/testnet/tx/..."
}
```

### Response (خطا - 400)
```json
{
  "success": false,
  "error": "Amount must be between 1000 and 50000 satoshis"
}
```

### مثال PowerShell
```powershell
$body = @{
    address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"
    amount = 25000  # 25,000 satoshis
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:3000/api/send" `
    -Method Post `
    -Body $body `
    -ContentType "application/json"

Write-Host "Transaction: $($response.txHash)"
Write-Host "Amount: $($response.amount) satoshis"
Write-Host "Fee: $($response.fee) satoshis"
```

### مثال Python
```python
import requests

url = "http://localhost:3000/api/send"
data = {
    "address": "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx",
    "amount": 25000
}

response = requests.post(url, json=data)
result = response.json()

if result['success']:
    print(f"Transaction: {result['txHash']}")
    print(f"Amount: {result['amount']} satoshis")
    print(f"Fee: {result['fee']} satoshis")
    print(f"Explorer: {result['explorerUrl']}")
else:
    print(f"Error: {result['error']}")
```

### مثال JavaScript (Node.js)
```javascript
const axios = require('axios');

async function sendBitcoin(address, amount) {
    try {
        const response = await axios.post('http://localhost:3000/api/send', {
            address: address,
            amount: amount
        });
        
        console.log('Transaction:', response.data.txHash);
        console.log('Amount:', response.data.amount, 'satoshis');
        console.log('Fee:', response.data.fee, 'satoshis');
        console.log('Explorer:', response.data.explorerUrl);
        
        return response.data;
    } catch (error) {
        console.error('Error:', error.response.data.error);
    }
}

sendBitcoin('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', 25000);
```

### مثال C#
```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class FaucetClient
{
    private static readonly HttpClient client = new HttpClient();
    
    public static async Task<string> SendBitcoin(string address, int amount)
    {
        var requestBody = new
        {
            address = address,
            amount = amount
        };
        
        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var response = await client.PostAsync(
            "http://localhost:3000/api/send",
            content
        );
        
        var responseString = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(responseString);
        
        if (result.GetProperty("success").GetBoolean())
        {
            var txHash = result.GetProperty("txHash").GetString();
            var sentAmount = result.GetProperty("amount").GetInt32();
            var fee = result.GetProperty("fee").GetInt32();
            
            Console.WriteLine($"Transaction: {txHash}");
            Console.WriteLine($"Amount: {sentAmount} satoshis");
            Console.WriteLine($"Fee: {fee} satoshis");
            
            return txHash;
        }
        else
        {
            var error = result.GetProperty("error").GetString();
            Console.WriteLine($"Error: {error}");
            return null;
        }
    }
    
    static async Task Main()
    {
        await SendBitcoin("tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx", 25000);
    }
}
```

### مثال PHP
```php
<?php
function sendBitcoin($address, $amount) {
    $url = 'http://localhost:3000/api/send';
    
    $data = array(
        'address' => $address,
        'amount' => $amount
    );
    $json = json_encode($data);
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($result['success']) {
        echo "Transaction: " . $result['txHash'] . "\n";
        echo "Amount: " . $result['amount'] . " satoshis\n";
        echo "Fee: " . $result['fee'] . " satoshis\n";
        echo "Explorer: " . $result['explorerUrl'] . "\n";
        return $result['txHash'];
    } else {
        echo "Error: " . $result['error'] . "\n";
        return null;
    }
}

sendBitcoin('tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx', 25000);
?>
```

---

## 🔧 کلاس کامل C# (آماده استفاده)

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BitcoinFaucetClient
{
    public class FaucetApiClient : IDisposable
    {
        private readonly HttpClient _client;
        private readonly string _baseUrl;
        
        public FaucetApiClient(string baseUrl = "http://localhost:3000")
        {
            _client = new HttpClient();
            _baseUrl = baseUrl;
        }
        
        /// <summary>
        /// دریافت Bitcoin با مقدار پیش‌فرض
        /// </summary>
        public async Task<FaucetResponse> ClaimAsync(string address)
        {
            var requestBody = new { address };
            return await SendRequestAsync("/api/claim", requestBody);
        }
        
        /// <summary>
        /// ارسال مقدار دلخواه Bitcoin (1000-50000 satoshi)
        /// </summary>
        public async Task<FaucetResponse> SendAsync(string address, int amount)
        {
            if (amount < 1000 || amount > 50000)
                throw new ArgumentException("Amount must be between 1000 and 50000 satoshis");
                
            var requestBody = new { address, amount };
            return await SendRequestAsync("/api/send", requestBody);
        }
        
        private async Task<FaucetResponse> SendRequestAsync(string endpoint, object body)
        {
            try
            {
                var json = JsonSerializer.Serialize(body);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                
                var response = await _client.PostAsync(_baseUrl + endpoint, content);
                var responseString = await response.Content.ReadAsStringAsync();
                
                return JsonSerializer.Deserialize<FaucetResponse>(responseString);
            }
            catch (Exception ex)
            {
                return new FaucetResponse
                {
                    Success = false,
                    Error = ex.Message
                };
            }
        }
        
        public void Dispose()
        {
            _client?.Dispose();
        }
    }
    
    public class FaucetResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string TxHash { get; set; }
        public int Amount { get; set; }
        public int Fee { get; set; }
        public string ExplorerUrl { get; set; }
        public string Error { get; set; }
        
        // Helper properties for JSON deserialization
        [JsonPropertyName("success")]
        public bool success 
        { 
            get => Success; 
            set => Success = value; 
        }
        
        [JsonPropertyName("message")]
        public string message 
        { 
            get => Message; 
            set => Message = value; 
        }
        
        [JsonPropertyName("txHash")]
        public string txHash 
        { 
            get => TxHash; 
            set => TxHash = value; 
        }
        
        [JsonPropertyName("amount")]
        public int amount 
        { 
            get => Amount; 
            set => Amount = value; 
        }
        
        [JsonPropertyName("fee")]
        public int fee 
        { 
            get => Fee; 
            set => Fee = value; 
        }
        
        [JsonPropertyName("explorerUrl")]
        public string explorerUrl 
        { 
            get => ExplorerUrl; 
            set => ExplorerUrl = value; 
        }
        
        [JsonPropertyName("error")]
        public string error 
        { 
            get => Error; 
            set => Error = value; 
        }
    }
    
    // مثال استفاده
    class Program
    {
        static async Task Main(string[] args)
        {
            using var client = new FaucetApiClient("http://localhost:3000");
            
            string address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx";
            
            // استفاده از Claim API
            Console.WriteLine("Claiming Bitcoin...");
            var claimResult = await client.ClaimAsync(address);
            
            if (claimResult.Success)
            {
                Console.WriteLine($"✅ Success!");
                Console.WriteLine($"   TX: {claimResult.TxHash}");
                Console.WriteLine($"   Amount: {claimResult.Amount} satoshis");
            }
            else
            {
                Console.WriteLine($"❌ Error: {claimResult.Error}");
            }
            
            // استفاده از Send API
            Console.WriteLine("\nSending custom amount...");
            var sendResult = await client.SendAsync(address, 25000);
            
            if (sendResult.Success)
            {
                Console.WriteLine($"✅ Success!");
                Console.WriteLine($"   TX: {sendResult.TxHash}");
                Console.WriteLine($"   Amount: {sendResult.Amount} satoshis");
                Console.WriteLine($"   Fee: {sendResult.Fee} satoshis");
                Console.WriteLine($"   Explorer: {sendResult.ExplorerUrl}");
            }
            else
            {
                Console.WriteLine($"❌ Error: {sendResult.Error}");
            }
        }
    }
}
```

---

## 🐍 کلاس کامل Python (آماده استفاده)

```python
import requests
from typing import Dict, Optional

class FaucetApiClient:
    """
    کلاس برای اتصال به Bitcoin Testnet Faucet API
    """
    
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})
    
    def claim(self, address: str) -> Dict:
        """
        دریافت Bitcoin با مقدار پیش‌فرض
        
        Args:
            address: Bitcoin testnet address
            
        Returns:
            dict: پاسخ API شامل txHash, amount, fee, explorerUrl
        """
        url = f"{self.base_url}/api/claim"
        data = {"address": address}
        
        try:
            response = self.session.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"success": False, "error": str(e)}
    
    def send(self, address: str, amount: int) -> Dict:
        """
        ارسال مقدار دلخواه Bitcoin
        
        Args:
            address: Bitcoin testnet address
            amount: مقدار به satoshi (1000-50000)
            
        Returns:
            dict: پاسخ API شامل txHash, amount, fee, explorerUrl
        """
        if amount < 1000 or amount > 50000:
            return {
                "success": False,
                "error": "Amount must be between 1000 and 50000 satoshis"
            }
        
        url = f"{self.base_url}/api/send"
        data = {
            "address": address,
            "amount": amount
        }
        
        try:
            response = self.session.post(url, json=data)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"success": False, "error": str(e)}
    
    def close(self):
        """بستن session"""
        self.session.close()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


# مثال استفاده
if __name__ == "__main__":
    address = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"
    
    with FaucetApiClient("http://localhost:3000") as client:
        # استفاده از Claim API
        print("Claiming Bitcoin...")
        result = client.claim(address)
        
        if result['success']:
            print(f"✅ Success!")
            print(f"   TX: {result['txHash']}")
            print(f"   Amount: {result['amount']} satoshis")
        else:
            print(f"❌ Error: {result['error']}")
        
        # استفاده از Send API
        print("\nSending custom amount...")
        result = client.send(address, 25000)
        
        if result['success']:
            print(f"✅ Success!")
            print(f"   TX: {result['txHash']}")
            print(f"   Amount: {result['amount']} satoshis")
            print(f"   Fee: {result['fee']} satoshis")
            print(f"   Explorer: {result['explorerUrl']}")
        else:
            print(f"❌ Error: {result['error']}")
```

---

## 🚀 شروع سریع

### 1. اطمینان از اجرای سرور
```powershell
node server.js
```

### 2. تست با cURL
```bash
# Claim API
curl -X POST http://localhost:3000/api/claim \
  -H "Content-Type: application/json" \
  -d '{"address":"tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"}'

# Send API
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"address":"tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx","amount":25000}'
```

### 3. استفاده در برنامه خود
- از کلاس‌های آماده بالا استفاده کنید
- یا کد خود را بر اساس مثال‌ها بنویسید

---

## ❗ خطاهای رایج

### خطای 400: Invalid Bitcoin testnet address
```json
{"success": false, "error": "Invalid Bitcoin testnet address"}
```
**راه حل**: آدرس Bitcoin testnet معتبر وارد کنید (شروع با 'm', 'n', یا 'tb1')

### خطای 400: Amount must be between...
```json
{"success": false, "error": "Amount must be between 1000 and 50000 satoshis"}
```
**راه حل**: مقدار را بین 1000 تا 50000 قرار دهید

### خطای 500: Insufficient funds
```json
{"success": false, "error": "Insufficient funds in faucet wallet"}
```
**راه حل**: کیف پول faucet موجودی کافی ندارد - باید شارژ شود

---

## 📊 بررسی تراکنش‌ها

### در Admin Panel
```
http://localhost:3000/admin
```
- نام کاربری: admin
- رمز عبور: مطابق `.env` شما

### در Blockchain Explorer
از `explorerUrl` در پاسخ API استفاده کنید:
```
https://mempool.space/testnet/tx/YOUR_TX_HASH
```

---

**🎉 حالا آماده استفاده هستید!**
