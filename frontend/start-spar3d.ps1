# Remove any existing container
docker rm -f spar3d-local 2>$null

# Start the container with GPU access and volume mount
docker run --gpus all --name spar3d-local `
  -p 3005:3005 `
  -v $PWD\spar3d\checkpoints:/app/checkpoints `
  spar3d:cuda12