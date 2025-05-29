Write-Host "Clearing Next.js cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue

Write-Host "Restarting server..." -ForegroundColor Green
npm run dev