# ATLAS Project Cleanup Script
# This script removes duplicate folders and prepares the project for Vercel deployment

Write-Host "🧹 ATLAS Project Cleanup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Get current directory
$projectRoot = Get-Location

Write-Host "📁 Project root: $projectRoot" -ForegroundColor Yellow
Write-Host ""

# Confirm before proceeding
Write-Host "⚠️  This script will:" -ForegroundColor Yellow
Write-Host "   1. Delete the duplicate 'app' folder (keeping backend/app)" -ForegroundColor White
Write-Host "   2. Verify backend structure is intact" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Do you want to proceed? (yes/no)"

if ($confirmation -ne "yes") {
    Write-Host "❌ Cleanup cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "🚀 Starting cleanup..." -ForegroundColor Green
Write-Host ""

# Step 1: Check if duplicate app folder exists
$duplicateAppPath = Join-Path $projectRoot "app"
$backendAppPath = Join-Path $projectRoot "backend\app"

if (Test-Path $duplicateAppPath) {
    Write-Host "✅ Found duplicate 'app' folder" -ForegroundColor Green
    
    # Verify backend/app exists before deleting
    if (Test-Path $backendAppPath) {
        Write-Host "✅ Verified 'backend/app' exists" -ForegroundColor Green
        
        # Delete duplicate app folder
        Write-Host "🗑️  Deleting duplicate 'app' folder..." -ForegroundColor Yellow
        Remove-Item -Path $duplicateAppPath -Recurse -Force
        
        if (-not (Test-Path $duplicateAppPath)) {
            Write-Host "✅ Successfully deleted duplicate 'app' folder" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to delete duplicate 'app' folder" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ ERROR: 'backend/app' not found! Cannot proceed." -ForegroundColor Red
        Write-Host "   Please verify your project structure." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "No duplicate app folder found (already cleaned)" -ForegroundColor Cyan
}

Write-Host ""

# Step 2: Verify project structure
Write-Host "🔍 Verifying project structure..." -ForegroundColor Yellow
Write-Host ""

$requiredPaths = @(
    "backend\app",
    "backend\main.py",
    "frontend\src",
    "frontend\package.json",
    "api\index.py",
    "vercel.json",
    "requirements.txt",
    ".env.example"
)

$allGood = $true

foreach ($path in $requiredPaths) {
    $fullPath = Join-Path $projectRoot $path
    if (Test-Path $fullPath) {
        Write-Host "✅ $path" -ForegroundColor Green
    } else {
        Write-Host "❌ $path (MISSING)" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""

if ($allGood) {
    Write-Host "🎉 Project structure verified successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Review DEPLOYMENT_GUIDE.md for deployment instructions" -ForegroundColor White
    Write-Host "   2. Copy .env.example to .env and fill in your values" -ForegroundColor White
    Write-Host "   3. Install Vercel CLI: npm install -g vercel" -ForegroundColor White
    Write-Host "   4. Run: vercel login" -ForegroundColor White
    Write-Host "   5. Run: vercel (to deploy)" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Cleanup complete!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some files are missing. Please check the errors above." -ForegroundColor Yellow
    Write-Host "   You may need to create missing files before deployment." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
