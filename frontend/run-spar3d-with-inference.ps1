# Remove any existing container
docker rm -f spar3d-local 2>$null

# Create data and out directories if they don't exist
if (-not (Test-Path -Path ".\data")) {
    New-Item -ItemType Directory -Path ".\data" | Out-Null
    Write-Host "Created data directory for model outputs"
}

if (-not (Test-Path -Path ".\out")) {
    New-Item -ItemType Directory -Path ".\out" | Out-Null
    Write-Host "Created out directory for model outputs"
}

# Run the container with GPU support and data volume mapping
docker run -d --name spar3d-local `
  -p 3005:3005 `
  --gpus all `
  -v ${PWD}\data:/app/data `
  -v ${PWD}\out:/tmp/out `
  spar3d:cuda12-fixed

Write-Host "Spar3D container started with data volume mapping."

# Copy the inference endpoint script to the container
Write-Host "Copying inference endpoint script to the container..."
docker cp add-inference-endpoint.py spar3d-local:/app/

# Install required packages and fix Flet version
Write-Host "Installing required packages and fixing Flet version..."
docker exec spar3d-local pip install -U 'flet>=0.23.1,<0.26'

# Stop the current server process
Write-Host "Stopping the current server process..."
docker exec spar3d-local pkill -f "uvicorn"

# Start the new server with the inference endpoint
Write-Host "Starting the new server with the inference endpoint..."
docker exec -d spar3d-local python3 /app/add-inference-endpoint.py

Write-Host "Waiting for the server to start..."
Start-Sleep -Seconds 5

Write-Host "Server is now running with the /inference endpoint."
Write-Host "You can test it with:"
Write-Host "curl -X POST http://localhost:3005/inference -H 'Content-Type: application/json' -d '{\"prompt\":\"low-poly robot\",\"points\":20000,\"seed\":123}'"
Write-Host "Or visit http://localhost:3005/docs to use the Swagger UI."