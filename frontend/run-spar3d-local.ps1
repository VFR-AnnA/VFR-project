# Remove any existing container
docker rm -f spar3d-local 2>$null

# Run the container with GPU support in detached mode
docker run -d --gpus all -p 3005:3005 `
  -v ${PWD}\out:/app/out `
  --name spar3d-local spar3d:cuda12-fixed