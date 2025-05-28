# Remove any existing container
docker rm -f spar3d-local 2>$null

# Start the container with GPU access and volume mount in detached mode
docker run --gpus all --name spar3d-local `
  -d `
  -p 3005:3005 `
  -v $PWD\spar3d\checkpoints:/app/checkpoints `
  spar3d:cuda12

# Wait a moment for the container to start
Start-Sleep -Seconds 5

# Check if the container is running
$containerStatus = docker ps --filter "name=spar3d-local" --format "{{.Status}}"
Write-Host "Container status: $containerStatus"

# Check the logs
Write-Host "Container logs:"
docker logs spar3d-local