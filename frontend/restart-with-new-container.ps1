# Stop and remove the existing container
Write-Host "Stopping and removing the existing container..."
docker stop spar3d-local
docker rm spar3d-local

# Create data and out directories if they don't exist
if (-not (Test-Path -Path ".\data")) {
    New-Item -ItemType Directory -Path ".\data" | Out-Null
    Write-Host "Created data directory for model outputs"
}

if (-not (Test-Path -Path ".\out")) {
    New-Item -ItemType Directory -Path ".\out" | Out-Null
    Write-Host "Created out directory for model outputs"
}

# Copy our modified serve_rest.py to a temporary location in the host
Write-Host "Preparing modified serve_rest.py..."
Copy-Item -Path "modified_serve_rest.py" -Destination "serve_rest.py.new"

# Run the container with GPU support and data volume mapping
# Mount the modified serve_rest.py file directly into the container
Write-Host "Starting new container with modified serve_rest.py..."
docker run -d --name spar3d-local `
  -p 3005:3005 `
  --gpus all `
  -v ${PWD}\data:/app/data `
  -v ${PWD}\out:/tmp/out `
  -v ${PWD}\serve_rest.py.new:/app/serve_rest.py `
  spar3d:cuda12-fixed

Write-Host "Spar3D container started with modified serve_rest.py."

# Install required packages and fix Flet version
Write-Host "Installing required packages and fixing Flet version..."
docker exec spar3d-local pip install -U 'flet>=0.23.1,<0.26' pyyaml

# Run the fix script
Write-Host "Running the configuration fix script..."
docker cp fix-spar3d-config.py spar3d-local:/app/
docker exec spar3d-local python3 /app/fix-spar3d-config.py

Write-Host "Waiting for the server to start..."
Start-Sleep -Seconds 5

Write-Host "Server is now running with the /inference endpoint."
Write-Host "You can test it with:"
Write-Host "curl -X POST http://localhost:3005/inference -H 'Content-Type: application/json' -d '{\"prompt\":\"chair\",\"points\":15000,\"seed\":42}'"
Write-Host "Or visit http://localhost:3005/docs to use the Swagger UI."

# Clean up the temporary file
Remove-Item -Path "serve_rest.py.new"