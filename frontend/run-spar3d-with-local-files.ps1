# Remove any existing container
docker rm -f spar3d-local 2>$null

# Create a temporary script to modify the inference.py file
$tempScript = @'
#!/bin/bash
# Install required packages
pip install python-multipart flet==0.10.3

# Create config.yaml in the checkpoints directory
mkdir -p /app/checkpoints
cat > /app/checkpoints/config.yaml << 'EOL'
# Basic SPAR3D configuration
model:
  type: spar3d
  point_dim: 3
  feature_dim: 256
  hidden_dim: 512
  num_layers: 8
  num_heads: 8
  dropout: 0.1
  activation: gelu
  norm: layer
  use_checkpoint: false
  low_vram_mode: false
EOL

# Modify the inference.py file to use local files
sed -i 's/pretrained_model="stabilityai\/stable-point-aware-3d"/pretrained_model="checkpoints"/' /app/inference.py

# Start the server
python3 /app/serve_rest.py
'@

# Save the temporary script
$tempScript | Out-File -FilePath "temp_script.sh" -Encoding utf8

# Run the container with the temporary script
docker run --rm --gpus all -p 3005:3005 --name spar3d-local `
  -v ${PWD}\spar3d\checkpoints\model.safetensors:/app/checkpoints/model.safetensors `
  -v ${PWD}\temp_script.sh:/app/temp_script.sh `
  spar3d:cuda12 /bin/bash -c "chmod +x /app/temp_script.sh && /app/temp_script.sh"

# Clean up the temporary script
Remove-Item -Path "temp_script.sh" -Force