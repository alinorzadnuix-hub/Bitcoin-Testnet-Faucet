# Show Admin Credentials from .env file

Write-Host "==================================================="
Write-Host "  Your Admin Credentials"
Write-Host "==================================================="
Write-Host ""

if (Test-Path ".env") {
    $envLines = Get-Content ".env"
    
    $username = ""
    $password = ""
    
    foreach ($line in $envLines) {
        if ($line -match "^ADMIN_USERNAME=(.*)") {
            $username = $matches[1].Trim()
        }
        if ($line -match "^ADMIN_PASSWORD=(.*)") {
            $password = $matches[1].Trim()
        }
    }
    
    if ($username -and $password) {
        Write-Host "Username: $username" -ForegroundColor Cyan
        Write-Host "Password: $password" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Use these credentials to login at:" -ForegroundColor Yellow
        Write-Host "http://localhost:3000/admin" -ForegroundColor Green
    }
    else {
        Write-Host "ERROR: Credentials not found in .env file!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please add these lines to your .env file:"
        Write-Host "ADMIN_USERNAME=admin"
        Write-Host "ADMIN_PASSWORD=YourSecurePassword"
    }
}
else {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create .env file from .env.example:"
    Write-Host "copy .env.example .env"
}

Write-Host ""
Write-Host "==================================================="
