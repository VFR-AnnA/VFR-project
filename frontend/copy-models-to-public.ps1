# Ensure the public/models directory exists
if (-not (Test-Path ".\public\models")) {
    New-Item -ItemType Directory -Path ".\public\models" -Force | Out-Null
    Write-Host "Created public/models directory"
}

# Copy all GLB files from the output directory to public/models
if (Test-Path ".\out\*.glb") {
    Copy-Item ".\out\*.glb" ".\public\models\" -Force
    Write-Host "Copied GLB files from out directory to public/models"
} else {
    Write-Host "No GLB files found in out directory"
}

# Also try to copy from Docker container if it's running
try {
    $containerRunning = docker inspect --format='{{.State.Running}}' spar3d-local 2>$null
    if ($containerRunning -eq "true") {
        Write-Host "Copying GLB files from Docker container..."
        docker exec spar3d-local bash -c "find /app/out -name '*.glb' -exec cp {} /app/out/ \;"
        docker cp spar3d-local:/app/out/. .\out\
        
        # Copy the newly copied files to public/models
        if (Test-Path ".\out\*.glb") {
            Copy-Item ".\out\*.glb" ".\public\models\" -Force
            Write-Host "Copied GLB files from Docker container to public/models"
        }
    }
} catch {
    Write-Host "Could not copy from Docker container: $($_.Exception.Message)"
}

Write-Host "Done. GLB files should now be accessible at /models/filename.glb"