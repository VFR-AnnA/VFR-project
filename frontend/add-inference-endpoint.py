"""
Script to add the /inference endpoint to the Spar3D container.
This should be run inside the container.
"""

import os
import json
import uuid
import tempfile
import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

# Import the SPAR3D model
from spar3d.system import SPAR3D
from spar3d.utils import get_device

# Define the request model
class InferenceRequest(BaseModel):
    prompt: str
    points: int = 20000
    seed: Optional[int] = None

# Create a new FastAPI app
app = FastAPI(title="SPAR3D API", version="0.1")

# Load the model
device = get_device()
print(f"Using device: {device}")

try:
    model = SPAR3D.from_pretrained(
        "checkpoints",
        config_name="config.yaml",
        weight_name="model.safetensors",
        low_vram_mode=True,
    )
    model.to(device)
    model.eval()
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.post("/inference")
async def inference(request: InferenceRequest):
    """Generate a 3D model from a text prompt.
    
    Args:
        prompt: Text description of the 3D model to generate
        points: Number of points to generate (default: 20000)
        seed: Random seed for reproducibility (optional)
        
    Returns:
        model_uri: Path to the generated GLB file
        points: Number of points used
        seed: Seed used for generation
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Set seed if provided
    if request.seed is not None:
        torch.manual_seed(request.seed)
    else:
        # Generate a random seed
        request.seed = torch.randint(0, 2**32 - 1, (1,)).item()
    
    # Create output directory
    timestamp = uuid.uuid4().hex
    out_dir = os.path.join("/tmp/out", timestamp)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "model.glb")
    
    try:
        # Run inference
        with torch.no_grad():
            with torch.autocast(device_type=device, dtype=torch.float16):
                points = model.sample_points(
                    [request.prompt],
                    num_points=request.points,
                )
                mesh, _ = model.reconstruct_mesh(
                    points,
                    bake_resolution=1024,
                    remesh="none",
                    vertex_count=-1,
                    return_points=False,
                )
        
        # Export mesh
        if isinstance(mesh, list):
            mesh = mesh[0]
        mesh.export(out_path, include_normals=True)
        
        return {
            "model_uri": out_path,
            "points": request.points,
            "seed": request.seed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3005)