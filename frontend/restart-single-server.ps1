# Stop any running Next.js servers on ports 3010 and 3011
Write-Host "Stopping Next.js servers on ports 3010 and 3011..."
Get-Process | Where-Object { $_.CommandLine -like "*next dev -p 3010*" -or $_.CommandLine -like "*next dev -p 3011*" } | ForEach-Object { 
    try {
        Stop-Process -Id $_.Id -Force
        Write-Host "Stopped process $($_.Id)"
    } catch {
        Write-Host "Failed to stop process $($_.Id): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Ensure the public/models directory exists
if (-not (Test-Path ".\public\models")) {
    New-Item -ItemType Directory -Path ".\public\models" -Force | Out-Null
    Write-Host "Created public/models directory"
}

# Copy any GLB files from the out directory to public/models
if (Test-Path ".\out") {
    Get-ChildItem -Path ".\out" -Recurse -Filter "*.glb" | ForEach-Object {
        $destination = Join-Path ".\public\models" $_.Name
        Copy-Item -Path $_.FullName -Destination $destination -Force
        Write-Host "Copied $($_.Name) to public/models"
    }
}

# Restart the Next.js server on port 3012 with the updated environment variables
Write-Host "Restarting Next.js server on port 3012..."
$env:NEXT_PUBLIC_FEATURE_GEN = "true"
$env:NEXT_DISABLE_FILE_SYSTEM_CACHE = "true"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_CACHE_DIR = "D:\next-cache"

# Check if the server on port 3012 is already running
$server3012Running = Get-Process | Where-Object { $_.CommandLine -like "*next dev -p 3012*" }
if ($server3012Running) {
    Write-Host "Server on port 3012 is already running. Reloading environment variables."
} else {
    Write-Host "Starting new server on port 3012..."
    Start-Process powershell -ArgumentList "-Command", "npx next dev -p 3012"
}

Write-Host "`nSetup complete. Access the generator at http://localhost:3012/try/generator"
Write-Host "Model files will be served from http://localhost:3012/models/"