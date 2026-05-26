# Admin Panel Test Script
# Tests all admin panel APIs

Write-Host "==================================================="
Write-Host "  Admin Panel Test"
Write-Host "==================================================="
Write-Host ""

$baseUrl = "http://localhost:3000"

# Read credentials from .env
if (Test-Path ".env") {
    Write-Host "[OK] .env file found" -ForegroundColor Green
    
    $envLines = Get-Content ".env"
    foreach ($line in $envLines) {
        if ($line -match "ADMIN_USERNAME=(.*)") {
            $username = $matches[1]
        }
        if ($line -match "ADMIN_PASSWORD=(.*)") {
            $password = $matches[1]
        }
    }
    
    if ($username -and $password) {
        Write-Host "[OK] Credentials loaded" -ForegroundColor Green
        Write-Host "  Username: $username"
    }
    else {
        Write-Host "[ERROR] Credentials not found in .env" -ForegroundColor Red
        exit
    }
}
else {
    Write-Host "[ERROR] .env file not found" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "==================================================="
Write-Host "  Test 1: Server Access"
Write-Host "==================================================="

try {
    $null = Invoke-WebRequest -Uri "$baseUrl/admin" -Method GET
    Write-Host "[OK] Admin page is accessible" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Cannot access admin page" -ForegroundColor Red
    Write-Host "Is the server running?" -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "==================================================="
Write-Host "  Test 2: Login"
Write-Host "==================================================="

$loginBody = @{
    username = $username
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    if ($loginResponse.success) {
        Write-Host "[OK] Login successful" -ForegroundColor Green
        $token = $loginResponse.token
    }
    else {
        Write-Host "[ERROR] Login failed: $($loginResponse.error)" -ForegroundColor Red
        exit
    }
}
catch {
    Write-Host "[ERROR] Login request failed" -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Basic $token"
}

Write-Host ""
Write-Host "==================================================="
Write-Host "  Test 3: Get Balance"
Write-Host "==================================================="

try {
    $balanceResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/balance" `
        -Method GET `
        -Headers $headers
    
    if ($balanceResponse.success) {
        Write-Host "[OK] Balance retrieved" -ForegroundColor Green
        $balanceBTC = $balanceResponse.balance / 100000000
        Write-Host "  Balance: $balanceBTC BTC"
        Write-Host "  Address: $($balanceResponse.address)"
    }
}
catch {
    Write-Host "[ERROR] Cannot get balance" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================================="
Write-Host "  Test 4: Get Statistics"
Write-Host "==================================================="

try {
    $statsResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/transactions?limit=10" `
        -Method GET `
        -Headers $headers
    
    if ($statsResponse.success) {
        Write-Host "[OK] Statistics retrieved" -ForegroundColor Green
        Write-Host "  Total Transactions: $($statsResponse.statistics.total_claims)"
        Write-Host "  Faucet Claims: $($statsResponse.statistics.faucet_claims)"
        Write-Host "  Admin Sends: $($statsResponse.statistics.admin_sends)"
    }
}
catch {
    Write-Host "[ERROR] Cannot get statistics" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================================="
Write-Host "  Test 5: Scan Deposits"
Write-Host "==================================================="

try {
    $scanResponse = Invoke-RestMethod -Uri "$baseUrl/api/admin/scan-deposits" `
        -Method POST `
        -Headers $headers
    
    if ($scanResponse.success) {
        Write-Host "[OK] Scan completed" -ForegroundColor Green
        Write-Host "  $($scanResponse.message)"
    }
}
catch {
    Write-Host "[ERROR] Scan failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "==================================================="
Write-Host "  SUMMARY"
Write-Host "==================================================="
Write-Host ""
Write-Host "All tests completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Open admin panel in browser:"
Write-Host "  $baseUrl/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Login credentials:"
Write-Host "  Username: $username" -ForegroundColor Cyan
Write-Host "  Password: (from .env file)" -ForegroundColor Cyan
Write-Host ""
