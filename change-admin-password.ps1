# Change Admin Password Script

param(
    [string]$NewPassword = "BitcoinFaucet2025!Secure"
)

Write-Host "==================================================="
Write-Host "  Change Admin Password"
Write-Host "==================================================="
Write-Host ""

if (-not (Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Creating .env from .env.example..."
    Copy-Item ".env.example" ".env"
    Write-Host "Done!" -ForegroundColor Green
}

Write-Host "Reading current .env file..." -ForegroundColor Yellow

$envContent = Get-Content ".env" -Raw

# Update password
if ($envContent -match "ADMIN_PASSWORD=.*") {
    $envContent = $envContent -replace "ADMIN_PASSWORD=.*", "ADMIN_PASSWORD=$NewPassword"
    Write-Host "Password updated in memory" -ForegroundColor Green
}
else {
    Write-Host "Adding ADMIN_PASSWORD to .env..." -ForegroundColor Yellow
    $envContent += "`nADMIN_PASSWORD=$NewPassword`n"
}

# Save file
$envContent | Set-Content ".env" -NoNewline

Write-Host ""
Write-Host "==================================================="
Write-Host "  Password Changed Successfully!"
Write-Host "==================================================="
Write-Host ""
Write-Host "New credentials:" -ForegroundColor Green
Write-Host "  Username: admin" -ForegroundColor Cyan
Write-Host "  Password: $NewPassword" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Restart the server for changes to take effect!" -ForegroundColor Yellow
Write-Host ""
Write-Host "To restart:"
Write-Host "  1. Press Ctrl+C in the server terminal"
Write-Host "  2. Run: node server.js"
Write-Host "  OR just run: start.bat"
Write-Host ""
Write-Host "==================================================="
