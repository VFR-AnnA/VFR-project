# Stop the existing container if it's running
docker stop spar3d-local

# Start the container with a shell command that installs the correct flet version
docker run --gpus all -d -p 3005:3005 --name spar3d-local spar3d:cuda12-fixed /bin/bash -c "pip install -U 'flet>=0.23.1,<0.26' && python3 serve_rest.py"