# Remove any existing container
docker rm -f spar3d-local 2>$null

# Create data directory if it doesn't exist
if (-not (Test-Path -Path ".\data")) {
    New-Item -ItemType Directory -Path ".\data" | Out-Null
    Write-Host "Created data directory for model outputs"
}

# Run the container with GPU support and data volume mapping
docker run --name spar3d-local `
  -p 3005:3005 `
  --gpus all `
  -v ${PWD}\data:/app/data `
  spar3d:cuda12-fixed

Write-Host "Spar3D container started with data volume mapping."
Write-Host "Generated models will be saved to the ./data directory."