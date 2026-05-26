# Test Login
$body = @{
    username = "admin"
    password = "BitcoinFaucet2025!Secure"
} | ConvertTo-Json

Write-Host "Testing login with:"
Write-Host "Username: admin"
Write-Host "Password: BitcoinFaucet2025!Secure"
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host "Token: $($response.token)"
}
catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.ErrorDetails.Message)"
}
