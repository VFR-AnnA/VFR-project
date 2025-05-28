"""
Script to fix the SPAR3D configuration issues causing the 'Empty module name' error.
This should be run inside the container.
"""

import os
import yaml
import shutil

# Ensure the tets directory exists
tets_dir = '/app/load/tets'
os.makedirs(tets_dir, exist_ok=True)

# Copy the tets file from the correct location
source_tets = '/app/spar3d/load/tets/160_tets.npz'
dest_tets = os.path.join(tets_dir, '128_tets.npz')
if os.path.exists(source_tets):
    shutil.copy(source_tets, dest_tets)
    print(f"Copied tets file from {source_tets} to {dest_tets}")
else:
    print(f"Warning: Source tets file {source_tets} not found")

# Fix the configuration file
config_path = '/app/checkpoints/config.yaml'
if os.path.exists(config_path):
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)
    
    # Add missing configuration values
    if 'isosurface_resolution' not in config:
        config['isosurface_resolution'] = 128
        print("Added missing isosurface_resolution")
    
    # Fix empty module name issues
    if 'pdiff_image_tokenizer_cls' in config and not config['pdiff_image_tokenizer_cls']:
        config['pdiff_image_tokenizer_cls'] = 'spar3d.models.tokenizers.dinov2.DinoV2ImageTokenizer'
        print("Fixed empty pdiff_image_tokenizer_cls")
    
    # Save the updated configuration
    with open(config_path, 'w') as f:
        yaml.dump(config, f)
    print(f"Updated configuration saved to {config_path}")
else:
    print(f"Warning: Configuration file {config_path} not found")

print("Configuration fix completed.")