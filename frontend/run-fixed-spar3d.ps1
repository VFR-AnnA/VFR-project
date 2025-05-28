# Stop and remove any existing container
docker stop spar3d-local 2>$null
docker rm spar3d-local 2>$null

# Create out directory if it doesn't exist
if (-not (Test-Path -Path ".\out")) {
    New-Item -ItemType Directory -Path ".\out" | Out-Null
    Write-Host "Created out directory for model outputs"
}

# Run the container with GPU support and data volume mapping
Write-Host "Starting new container..."
docker run -d --name spar3d-local `
  -p 3005:3005 `
  --gpus all `
  -v ${PWD}\out:/app/out `
  spar3d:cuda12-fixed

Write-Host "Waiting for container to start..."
Start-Sleep -Seconds 2

# Copy our modified serve_rest.py file to the container
Write-Host "Copying modified serve_rest.py to the container..."
docker cp modified_serve_rest.py spar3d-local:/app/serve_rest.py

# Create the tets file
Write-Host "Creating tets file..."
docker exec spar3d-local bash -c "mkdir -p /app/load/tets && echo -n 'PK\x05\x06\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00\x00' > /app/load/tets/128_tets.npz"

# Fix the configuration file
Write-Host "Fixing configuration file..."
docker exec spar3d-local bash -c "echo 'isosurface_resolution: 128' >> /app/checkpoints/config.yaml"
docker exec spar3d-local bash -c "echo 'pdiff_image_tokenizer_cls: spar3d.models.tokenizers.dinov2.DinoV2ImageTokenizer' >> /app/checkpoints/config.yaml"

# Install required packages
Write-Host "Installing required packages..."
docker exec spar3d-local pip install -U 'flet>=0.23.1,<0.26' pyyaml

# Start the server
Write-Host "Starting the server..."
docker exec -d spar3d-local python3 /app/serve_rest.py

Write-Host "Waiting for the server to start..."
Start-Sleep -Seconds 5

Write-Host "Server is now running with the /inference endpoint."
Write-Host "You can test it with:"
Write-Host ".\test-minimal-inference.ps1"
Write-Host "Or visit http://localhost:3005/docs to use the Swagger UI."