# Test script for unlimited requests
# Run this to verify the 24-hour cooldown has been removed

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 Testing Unlimited Requests (No 24h Limit)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/claim"
$testAddress = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"
$successCount = 0
$errorCount = 0

Write-Host "Testing 5 consecutive requests to the same address..." -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le 5; $i++) {
    Write-Host "Request $i of 5" -ForegroundColor Cyan
    
    try {
        $body = @{
            address = $testAddress
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "  ✅ SUCCESS" -ForegroundColor Green
            Write-Host "     TX: $($response.txHash.Substring(0, 16))..." -ForegroundColor Gray
            Write-Host "     Amount: $($response.amount) satoshis" -ForegroundColor Gray
            $successCount++
        }
    }
    catch {
        $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
        
        if ($errorResponse.error -like "*can claim again in*" -or $errorResponse.error -like "*can send again in*") {
            Write-Host "  ❌ FAILED: Rate limit still active!" -ForegroundColor Red
            Write-Host "     Error: $($errorResponse.error)" -ForegroundColor Red
        }
        elseif ($errorResponse.error -like "*Too many requests*") {
            Write-Host "  ⚠️  Spam protection triggered (normal)" -ForegroundColor Yellow
            Write-Host "     This is the 15-minute rate limit (max 10 requests)" -ForegroundColor Gray
        }
        elseif ($errorResponse.error -like "*Insufficient funds*") {
            Write-Host "  ⚠️  Wallet has insufficient funds" -ForegroundColor Yellow
        }
        else {
            Write-Host "  ❌ ERROR: $($errorResponse.error)" -ForegroundColor Red
        }
        $errorCount++
    }
    
    # Small delay between requests
    if ($i -lt 5) {
        Start-Sleep -Seconds 2
    }
    Write-Host ""
}

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Results" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Successful: $successCount" -ForegroundColor Green
Write-Host "  ❌ Failed: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($successCount -ge 2) {
    Write-Host "✅ 24-hour rate limit successfully removed!" -ForegroundColor Green
    Write-Host "   Multiple requests to same address are working!" -ForegroundColor Green
}
elseif ($errorCount -gt 0) {
    Write-Host "⚠️  Check the errors above." -ForegroundColor Yellow
    Write-Host "   Common issues:" -ForegroundColor Gray
    Write-Host "   - Insufficient wallet balance" -ForegroundColor Gray
    Write-Host "   - Server not restarted after changes" -ForegroundColor Gray
}
else {
    Write-Host "⚠️  Unexpected result. Check server logs." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "View all transactions at: http://localhost:3000/admin" -ForegroundColor Gray
