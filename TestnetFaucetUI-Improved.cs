using UnityEngine;
using UnityEngine.UI;
using UnityEngine.Networking;
using System.Collections;

public class TestnetFaucetUI : MonoBehaviour
{
    [Header("UI References")]
    public InputField amountInputField;
    public Button requestButton;
    
    [Header("Error Panel")]
    public GameObject errorPanel;  // GameObject برای نمایش خطاها
    public Text errorText;         // Text داخل errorPanel

    [Header("Faucet Settings")]
    public string faucetURL = "http://localhost:3000/api/send";
    
    [Header("Amount Limits (BTC)")]
    public decimal minAmountBTC = 0.00001m;  // 1,000 satoshi
    public decimal maxAmountBTC = 0.01m;     // 1,000,000 satoshi

    private string currentWalletAddress = "";
    private const long SATOSHI_PER_BTC = 100000000;

    private void Start()
    {
        // Add button listener
        if (requestButton != null)
        {
            requestButton.onClick.AddListener(OnRequestButtonClicked);
        }

        // Get wallet address from WalletManager2
        LoadWalletAddress();
        
        // Hide error panel at start
        HideError();
    }
    
    private void ShowError(string message)
    {
        if (errorPanel != null)
        {
            errorPanel.SetActive(true);
        }
        
        if (errorText != null)
        {
            errorText.text = message;
        }
        
        Debug.LogError(message);
    }
    
    private void HideError()
    {
        if (errorPanel != null)
        {
            errorPanel.SetActive(false);
        }
    }

    private void LoadWalletAddress()
    {
        // Check if WalletManager2 exists and has a wallet
        if (WalletManager2.Instance != null && WalletManager2.Instance.HasWallet())
        {
            WalletData wallet = WalletManager2.Instance.GetCurrentWallet();
            
            // Check if wallet is on TestNet
            if (wallet != null)
            {
                if (wallet.isTestNet)
                {
                    currentWalletAddress = wallet.address;
                    HideError();
                    Debug.Log($"✓ Loaded TestNet Wallet Address: {currentWalletAddress}");
                }
                else
                {
                    ShowError("✗ ERROR: Please switch to TestNet in your wallet first!");
                    if (requestButton != null)
                    {
                        requestButton.interactable = false;
                    }
                }
            }
        }
        else
        {
            ShowError("✗ ERROR: No wallet found! Please create a wallet first.");
            if (requestButton != null)
            {
                requestButton.interactable = false;
            }
        }
    }

    private void OnRequestButtonClicked()
    {
        string amount = amountInputField != null ? amountInputField.text : "";

        // Validate wallet address
        if (string.IsNullOrEmpty(currentWalletAddress))
        {
            ShowError("✗ ERROR: No wallet address available!");
            return;
        }

        // Validate amount input
        if (string.IsNullOrEmpty(amount))
        {
            ShowError("⚠ Please enter an amount!");
            return;
        }

        // ✅ استفاده از decimal برای دقت بهتر (به جای float)
        if (!decimal.TryParse(amount, out decimal btcAmount) || btcAmount <= 0)
        {
            ShowError("⚠ Please enter a valid amount!");
            return;
        }

        // Convert to satoshi
        long satoshiAmount = ConvertBTCToSatoshi(btcAmount);
        
        // ✅ بررسی محدودیت‌ها قبل از ارسال
        long minSatoshi = ConvertBTCToSatoshi(minAmountBTC);
        long maxSatoshi = ConvertBTCToSatoshi(maxAmountBTC);
        
        if (satoshiAmount < minSatoshi)
        {
            ShowError($"⚠ Minimum amount: {minAmountBTC:F8} BTC ({minSatoshi:N0} Satoshi)");
            return;
        }
        
        if (satoshiAmount > maxSatoshi)
        {
            ShowError($"⚠ Maximum amount: {maxAmountBTC:F8} BTC ({maxSatoshi:N0} Satoshi)");
            return;
        }

        // Clear any previous errors
        HideError();
        
        Debug.Log($"→ Requesting {btcAmount} BTC ({satoshiAmount:N0} Satoshi) from faucet...");

        // Send request with current wallet address
        StartCoroutine(SendFaucetRequest(currentWalletAddress, satoshiAmount));
    }

    /// <summary>
    /// تبدیل BTC به Satoshi با دقت بالا
    /// ✅ استفاده از decimal به جای float برای جلوگیری از خطاهای گرد کردن
    /// </summary>
    private long ConvertBTCToSatoshi(decimal btcAmount)
    {
        // 1 BTC = 100,000,000 Satoshi
        return (long)(btcAmount * SATOSHI_PER_BTC);
    }

    private IEnumerator SendFaucetRequest(string address, long satoshiAmount)
    {
        Debug.Log("→ Sending request to faucet server...");

        // Disable button while processing
        if (requestButton != null)
        {
            requestButton.interactable = false;
        }

        // Create JSON payload
        FaucetRequest request = new FaucetRequest
        {
            address = address,
            amount = satoshiAmount
        };

        string jsonData = JsonUtility.ToJson(request);
        Debug.Log($"→ Request Payload: {jsonData}");

        // Create web request
        using (UnityWebRequest www = new UnityWebRequest(faucetURL, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonData);
            www.uploadHandler = new UploadHandlerRaw(bodyRaw);
            www.downloadHandler = new DownloadHandlerBuffer();
            www.SetRequestHeader("Content-Type", "application/json");

            // Send request
            yield return www.SendWebRequest();

            // Enable button again
            if (requestButton != null)
            {
                requestButton.interactable = true;
            }

            // Handle response
            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log($"→ Server Response: {www.downloadHandler.text}");
                
                try
                {
                    FaucetResponse response = JsonUtility.FromJson<FaucetResponse>(www.downloadHandler.text);
                    
                    if (response.success)
                    {
                        Debug.Log($"✓✓✓ SUCCESS! Bitcoin sent to your wallet! ✓✓✓");
                        Debug.Log($"✓ Transaction ID: {response.txHash}");
                        Debug.Log($"✓ Amount: {satoshiAmount:N0} Satoshi ({satoshiAmount / (decimal)SATOSHI_PER_BTC:F8} BTC)");
                        Debug.Log($"✓ Address: {address}");
                        Debug.Log($"✓ Explorer: {response.explorerUrl}");
                        
                        // Clear input field
                        if (amountInputField != null) amountInputField.text = "";
                        
                        // Add transaction to wallet history
                        if (WalletManager2.Instance != null)
                        {
                            decimal btcReceived = satoshiAmount / (decimal)SATOSHI_PER_BTC;
                            WalletManager2.Instance.AddTransaction(
                                "Received", 
                                "Testnet Faucet", 
                                btcReceived.ToString("0.00000000"), 
                                response.txHash
                            );
                            Debug.Log("✓ Transaction added to wallet history");
                        }
                    }
                    else
                    {
                        ShowError($"✗ FAUCET ERROR: {response.error}");
                        Debug.LogError($"✗✗✗ FAUCET ERROR ✗✗✗");
                        Debug.LogError($"✗ Error Message: {response.error}");
                    }
                }
                catch (System.Exception e)
                {
                    ShowError($"⚠ Server response error: {e.Message}");
                    Debug.LogWarning($"⚠ Raw Server Response: {www.downloadHandler.text}");
                    Debug.LogWarning($"⚠ Parse Error: {e.Message}");
                }
            }
            else
            {
                ShowError($"✗ REQUEST FAILED: {www.error}");
                Debug.LogError($"✗✗✗ REQUEST FAILED ✗✗✗");
                Debug.LogError($"✗ Error: {www.error}");
                Debug.LogError($"✗ URL: {faucetURL}");
                Debug.LogError($"✗ Response Code: {www.responseCode}");
            }
        }
    }

    /// <summary>
    /// تازه‌سازی آدرس کیف پول (می‌تواند هنگام تغییر شبکه فراخوانی شود)
    /// </summary>
    public void RefreshWalletAddress()
    {
        LoadWalletAddress();
    }

    /// <summary>
    /// بررسی اینکه آیا سرور در دسترس است یا خیر
    /// </summary>
    public IEnumerator CheckServerStatus()
    {
        string infoURL = faucetURL.Replace("/api/send", "/api/info");
        
        using (UnityWebRequest www = UnityWebRequest.Get(infoURL))
        {
            yield return www.SendWebRequest();
            
            if (www.result == UnityWebRequest.Result.Success)
            {
                Debug.Log("✓ Faucet server is online!");
                HideError();
            }
            else
            {
                ShowError("✗ Cannot connect to faucet server. Please check if server is running.");
                Debug.LogError($"✗ Server connection failed: {www.error}");
            }
        }
    }

    [System.Serializable]
    private class FaucetRequest
    {
        public string address;
        public long amount;
    }

    [System.Serializable]
    private class FaucetResponse
    {
        public bool success;
        public string message;
        public string txHash;
        public long amount;
        public long fee;
        public string explorerUrl;
        public string error;
    }
}
