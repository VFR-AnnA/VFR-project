# One-liner to run the Spar3D container with all recommended settings
# --rm = auto-cleanup
# --gpus all = Use RTX 4060
# -v ./out:/app/out = Generated models appear in your local out directory

# Create out directory if it doesn't exist
if (-not (Test-Path -Path ".\out")) {
    New-Item -ItemType Directory -Path ".\out" | Out-Null
    Write-Host "Created out directory for model outputs"
}

# Run the container with all recommended settings
docker run --rm --gpus all -p 3005:3005 ^
  -v ${PWD}\out:/app/out ^
  --name spar3d-local spar3d:cuda12-fixed

Write-Host "Container stopped and auto-cleaned up (--rm flag)"