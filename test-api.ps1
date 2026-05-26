# Test script for /api/send API endpoint
# Run this script to verify the API is working correctly

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🧪 Testing /api/send API Endpoint" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000/api/send"
$testAddress = "tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx"

# Test 1: Valid request (should succeed)
Write-Host "TEST 1: Valid request (10000 satoshi)" -ForegroundColor Yellow
try {
    $body = @{
        address = $testAddress
        amount = 10000
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        Write-Host "   Transaction: $($response.txHash)" -ForegroundColor Gray
        Write-Host "   Amount: $($response.amount) satoshis" -ForegroundColor Gray
        Write-Host "   Fee: $($response.fee) satoshis" -ForegroundColor Gray
        Write-Host "   Explorer: $($response.explorerUrl)" -ForegroundColor Gray
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "❌ FAILED: $($errorResponse.error)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Amount too low (should fail)
Write-Host "TEST 2: Amount too low (500 satoshi - below minimum)" -ForegroundColor Yellow
try {
    $body = @{
        address = $testAddress
        amount = 500
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "❌ Unexpected success - should have failed!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✅ Expected error: $($errorResponse.error)" -ForegroundColor Green
}
Write-Host ""

# Test 3: Amount too high (should fail)
Write-Host "TEST 3: Amount too high (100000 satoshi - above maximum)" -ForegroundColor Yellow
try {
    $body = @{
        address = $testAddress
        amount = 100000
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "❌ Unexpected success - should have failed!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✅ Expected error: $($errorResponse.error)" -ForegroundColor Green
}
Write-Host ""

# Test 4: Invalid address (should fail)
Write-Host "TEST 4: Invalid Bitcoin address" -ForegroundColor Yellow
try {
    $body = @{
        address = "invalid_address_12345"
        amount = 10000
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "❌ Unexpected success - should have failed!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✅ Expected error: $($errorResponse.error)" -ForegroundColor Green
}
Write-Host ""

# Test 5: Rate limiting (only if Test 1 succeeded)
Write-Host "TEST 5: Rate limiting (immediate second request)" -ForegroundColor Yellow
try {
    $body = @{
        address = $testAddress
        amount = 10000
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $baseUrl -Method Post -Body $body -ContentType "application/json"
    Write-Host "⚠️ No rate limit detected - wallet may have insufficient funds or test 1 failed" -ForegroundColor Yellow
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.error -like "*can send again in*") {
        Write-Host "✅ Rate limit working: $($errorResponse.error)" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($errorResponse.error)" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Testing Complete!" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTE: Test 1 may fail if the faucet wallet has insufficient funds." -ForegroundColor Gray
Write-Host "Check admin panel at: http://localhost:3000/admin" -ForegroundColor Gray
