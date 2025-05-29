# Remove any existing container
docker rm -f spar3d-local 2>$null

# Run the container with a custom command that installs python-multipart and flet==0.10.3 first
docker run --rm --gpus all -p 3005:3005 --name spar3d-local spar3d:cuda12 /bin/bash -c "pip install python-multipart flet==0.10.3 && python3 /app/serve_rest.py"