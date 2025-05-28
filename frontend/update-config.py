"""
Script to update the config.yaml file in the Spar3D container to add the isosurface_resolution parameter.
This should be run inside the container.
"""

import os
import yaml

# Path to the config file
config_path = "/app/checkpoints/config.yaml"

# Read the current config
with open(config_path, "r") as f:
    config = yaml.safe_load(f)

# Add the isosurface_resolution parameter
config["isosurface_resolution"] = 128  # A reasonable default value

# Write the updated config
with open(config_path, "w") as f:
    yaml.dump(config, f, default_flow_style=False)

print(f"Updated {config_path} with isosurface_resolution parameter")