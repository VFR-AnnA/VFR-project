"""
Script to update the config.yaml file in the Spar3D container to use the available tets file.
This should be run inside the container.
"""

import os
import yaml

# Path to the config file
config_path = "/app/checkpoints/config.yaml"

# Read the current config
with open(config_path, "r") as f:
    config = yaml.safe_load(f)

# Update the isosurface_resolution parameter to match the available tets file
config["isosurface_resolution"] = 160  # Match the available 160_tets.npz file

# Write the updated config
with open(config_path, "w") as f:
    yaml.dump(config, f, default_flow_style=False)

print(f"Updated {config_path} with isosurface_resolution=160 to match the available tets file")