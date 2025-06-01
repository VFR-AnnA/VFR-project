Write-Host "Testing VFR Demo..." -ForegroundColor Green

# Test redirect
Write-Host "`nTesting /demo redirect:" -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "http://localhost:3000/demo" -MaximumRedirection 0 -ErrorAction SilentlyContinue
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Cyan
Write-Host "Location: $($response.Headers.Location)" -ForegroundColor Cyan

# Test Cegeka demo
Write-Host "`nOpening Cegeka demo:" -ForegroundColor Yellow
Start-Process "http://localhost:3000/cegeka-demo.html?autoplay=true"

Write-Host "`nDemo test complete!" -ForegroundColor Green