# Remove any existing container
docker rm -f spar3d-local 2>$null

# Run the container with a custom command that installs python-multipart and flet==0.10.3 first
# Also set the HF_TOKEN environment variable to allow downloading from Hugging Face
docker run --rm --gpus all -p 3005:3005 --name spar3d-local `
  -e HF_TOKEN="hf_dummy_token_for_demo_only" `
  -v ${PWD}\spar3d\checkpoints:/app/checkpoints `
  spar3d:cuda12 /bin/bash -c "pip install python-multipart flet==0.10.3 && python3 /app/serve_rest.py"