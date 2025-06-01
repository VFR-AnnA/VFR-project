Write-Host "🚨 Emergency VFR Demo Fix" -ForegroundColor Red

# 1. Kill all Node processes
Write-Host "Stopping all Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# 2. Clean everything
Write-Host "Cleaning build artifacts..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 3. Fresh install
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# 4. Create public folder structure
Write-Host "Creating folder structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path public/models

# 5. Download test GLB
Write-Host "Downloading test model..." -ForegroundColor Yellow
$glbUrl = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb"
Invoke-WebRequest -Uri $glbUrl -OutFile "public/models/mannequin.glb"

# 6. Start on correct port
Write-Host "`n✅ Starting server on port 3000..." -ForegroundColor Green
npm run dev