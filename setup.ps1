# ========================================
# Bitcoin Testnet Faucet - Auto Setup
# ========================================
# این اسکریپت همه‌چیز رو خودکار راه‌اندازی می‌کنه

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Bitcoin Testnet Faucet - Auto Setup  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ========================================
# Step 1: Check Node.js
# ========================================
Write-Host "🔍 Step 1: Checking Node.js..." -ForegroundColor Yellow

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    }
    else {
        throw "Node.js not found"
    }
}
catch {
    Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
    Write-Host "📥 Please install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host "⚠️  Press any key to exit..." -ForegroundColor Red
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""

# ========================================
# Step 2: Install Dependencies
# ========================================
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Yellow

if (Test-Path "node_modules") {
    Write-Host "✅ Dependencies already installed (node_modules exists)" -ForegroundColor Green
    $response = Read-Host "   Do you want to reinstall? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "   Installing..." -ForegroundColor Cyan
        npm install
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
            exit 1
        }
    }
}
else {
    Write-Host "   Installing..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# ========================================
# Step 3: Setup Environment File
# ========================================
Write-Host "⚙️  Step 3: Setting up environment file..." -ForegroundColor Yellow

if (Test-Path ".env") {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
    $response = Read-Host "   Do you want to recreate it? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "✅ .env file recreated from .env.example" -ForegroundColor Green
    }
}
else {
    Copy-Item ".env.example" ".env" -Force
    Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
}

Write-Host ""

# ========================================
# Step 4: Generate Wallet (Optional)
# ========================================
Write-Host "🔑 Step 4: Bitcoin Wallet Setup" -ForegroundColor Yellow

$response = Read-Host "   Do you want to generate a new wallet? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "   Generating new wallet..." -ForegroundColor Cyan
    node generate-wallet.js
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Copy the Private Key and Address above!" -ForegroundColor Red
    Write-Host "⚠️  Update them in .env file manually!" -ForegroundColor Red
    Write-Host ""
    $null = Read-Host "   Press Enter after you've updated .env file"
}
else {
    Write-Host "⚠️  Using wallet from .env file" -ForegroundColor Yellow
    Write-Host "   Make sure FAUCET_PRIVATE_KEY and FAUCET_ADDRESS are set!" -ForegroundColor Yellow
}

Write-Host ""

# ========================================
# Step 5: Verify Configuration
# ========================================
Write-Host "✔️  Step 5: Verifying configuration..." -ForegroundColor Yellow

$envContent = Get-Content ".env" -Raw

# Check if private key is set
if ($envContent -match "FAUCET_PRIVATE_KEY=([a-zA-Z0-9]+)") {
    $privateKey = $Matches[1]
    if ($privateKey -and $privateKey -ne "your_private_key_here_DO_NOT_SHARE" -and $privateKey.Length -gt 20) {
        Write-Host "✅ Private key is configured" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Private key might not be set correctly" -ForegroundColor Yellow
        Write-Host "   Current value: $privateKey" -ForegroundColor Gray
    }
}
else {
    Write-Host "❌ FAUCET_PRIVATE_KEY not found in .env" -ForegroundColor Red
}

# Check if address is set
if ($envContent -match "FAUCET_ADDRESS=([a-zA-Z0-9]+)") {
    $address = $Matches[1]
    if ($address -and $address -ne "your_address_here" -and $address.Length -gt 20) {
        Write-Host "✅ Faucet address is configured: $address" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Faucet address might not be set correctly" -ForegroundColor Yellow
    }
}
else {
    Write-Host "❌ FAUCET_ADDRESS not found in .env" -ForegroundColor Red
}

# Check admin credentials
if ($envContent -match "ADMIN_USERNAME=([a-zA-Z0-9]+)") {
    Write-Host "✅ Admin username configured: $($Matches[1])" -ForegroundColor Green
}

if ($envContent -match "ADMIN_PASSWORD=(.+)") {
    $password = $Matches[1].Trim()
    if ($password -eq "changeme123" -or $password -eq "BitcoinFaucet2025!Secure") {
        Write-Host "⚠️  WARNING: Using default admin password!" -ForegroundColor Yellow
        Write-Host "   Please change ADMIN_PASSWORD in .env file for security!" -ForegroundColor Yellow
    }
    else {
        Write-Host "✅ Admin password is set (custom)" -ForegroundColor Green
    }
}

Write-Host ""

# ========================================
# Step 6: Database Check
# ========================================
Write-Host "🗄️  Step 6: Database setup..." -ForegroundColor Yellow

if (Test-Path "faucet.db") {
    Write-Host "✅ Database file exists (faucet.db)" -ForegroundColor Green
    $response = Read-Host "   Do you want to delete and recreate? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Remove-Item "faucet.db" -Force
        Write-Host "✅ Old database deleted. New one will be created on first run." -ForegroundColor Green
    }
}
else {
    Write-Host "ℹ️  Database will be created automatically on first run" -ForegroundColor Cyan
}

Write-Host ""

# ========================================
# Step 7: Final Summary
# ========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ✅ Setup Complete!                    " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Make sure your wallet has some testnet BTC" -ForegroundColor White
Write-Host "   2. Start the server: node server.js" -ForegroundColor White
Write-Host "   3. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "   4. Admin panel: http://localhost:3000/admin" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Yellow
Write-Host "   • Get testnet BTC: https://testnet-faucet.com/btc-testnet/" -ForegroundColor Cyan
Write-Host "   • Block explorer: https://mempool.space/testnet" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   • راهنمای-اجرا.md - Basic usage guide" -ForegroundColor Cyan
Write-Host "   • راهنمای-قابلیت‌های-جدید.md - New features guide" -ForegroundColor Cyan
Write-Host "   • API-INTEGRATION-GUIDE.md - API documentation" -ForegroundColor Cyan
Write-Host ""

# ========================================
# Step 8: Ask to start server
# ========================================
$response = Read-Host "Do you want to start the server now? (Y/n)"
if ($response -ne "n" -and $response -ne "N") {
    Write-Host ""
    Write-Host "🚀 Starting server..." -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
    Write-Host ""
    node server.js
}
else {
    Write-Host ""
    Write-Host "✅ Setup complete! Run 'node server.js' when ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
