# cleanup-spar3d.ps1
# Script to stop and remove the spar3d-local container

Write-Host "Stopping spar3d-local container..." -ForegroundColor Cyan
docker stop spar3d-local

Write-Host "Removing spar3d-local container..." -ForegroundColor Cyan
docker rm spar3d-local

Write-Host "Cleanup complete." -ForegroundColor Green