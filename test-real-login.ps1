# Test Login with REAL password
$body = @{
    username = "admin"
    password = "changeme123"
} | ConvertTo-Json

Write-Host "==================================================="
Write-Host "  Testing Login with REAL Password"
Write-Host "==================================================="
Write-Host ""
Write-Host "Username: admin" -ForegroundColor Cyan
Write-Host "Password: changeme123" -ForegroundColor Cyan
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/login" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "SUCCESS! Login worked!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token: $($response.token.Substring(0, 20))..."
    Write-Host ""
    Write-Host "You can now login to admin panel at:" -ForegroundColor Yellow
    Write-Host "http://localhost:3000/admin" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Use these credentials:"
    Write-Host "  Username: admin"
    Write-Host "  Password: changeme123"
    Write-Host ""
    Write-Host "IMPORTANT: Change this weak password!" -ForegroundColor Red
    Write-Host "Run: .\change-admin-password.ps1"
}
catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Response: $($_.ErrorDetails.Message)"
    }
}

Write-Host ""
Write-Host "==================================================="
