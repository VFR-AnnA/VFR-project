"""
Script to update the config.yaml file in the Spar3D container to add all required parameters.
This should be run inside the container.
"""

import os
import yaml

# Path to the config file
config_path = "/app/checkpoints/config.yaml"

# Read the current config
with open(config_path, "r") as f:
    config = yaml.safe_load(f)

# Add all required parameters
config["isosurface_resolution"] = 160  # Match the available 160_tets.npz file
config["cond_image_size"] = 512  # Standard image size

# Write the updated config
with open(config_path, "w") as f:
    yaml.dump(config, f, default_flow_style=False)

print(f"Updated {config_path} with all required parameters")