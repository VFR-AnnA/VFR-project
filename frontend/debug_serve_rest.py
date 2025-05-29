"""
Minimal REST wrapper for SPAR3D with detailed error logging.
Start inside the container with:  uvicorn debug_serve_rest:app --host 0.0.0.0 --port 3005
"""

import tempfile, os, uuid
import torch
import traceback
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn
from inference import run_inference  # komt uit de SPAR3D-repo
from spar3d.system import SPAR3D
from spar3d.utils import get_device

# Define the request model for text-to-3D inference
class InferenceRequest(BaseModel):
    prompt: str
    points: int = 20000
    seed: Optional[int] = None

app = FastAPI(title="SPAR3D API", version="0.1")

# Load the model for text-to-3D inference
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
    print("Model loaded successfully for text-to-3D inference")
except Exception as e:
    print(f"Error loading model for text-to-3D inference: {e}")
    traceback.print_exc()
    model = None

@app.post("/generate")
async def generate(
    image: UploadFile = File(...),
    prompt: str = Form("")
):
    # --- save uploaded image to temp file ---
    suffix = os.path.splitext(image.filename)[-1] or ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await image.read())
        img_path = tmp.name

    # --- output path ---
    out_path = os.path.join(
        tempfile.gettempdir(), f"{uuid.uuid4().hex}.glb"
    )

    # --- run SPAR3D inference ---
    run_inference(
        img_path=img_path,
        prompt=prompt,
        output_path=out_path,
        fp16=True  # half precision -> minder VRAM
    )

    # --- stream GLB back ---
    return FileResponse(
        out_path,
        media_type="model/gltf-binary",
        filename="model.glb"
    )

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Global exception handler caught: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": traceback.format_exc()},
    )

@app.post("/inference")
async def inference(request: InferenceRequest):
    """
    Generate a 3D model from a text prompt.
    
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
        raise HTTPException(status_code=500, detail="Model not loaded for text-to-3D inference")
    
    # Set seed if provided
    if request.seed is not None:
        torch.manual_seed(request.seed)
    else:
        # Generate a random seed
        request.seed = torch.randint(0, 2**32 - 1, (1,)).item()
    
    # Create output directory
    timestamp = uuid.uuid4().hex
    out_dir = os.path.join("/app/out", timestamp)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "model.glb")
    
    try:
        print(f"Starting inference with prompt: {request.prompt}, points: {request.points}, seed: {request.seed}")
        # Run inference
        with torch.no_grad():
            with torch.autocast(device_type=device, dtype=torch.float16):
                points = model.sample_points(
                    [request.prompt],
                    num_points=request.points,
                )
                print(f"Generated {len(points)} point sets")
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
        print(f"Exported mesh to {out_path}")
        
        return {
            "model_uri": out_path,
            "points": request.points,
            "seed": request.seed
        }
    except Exception as e:
        print(f"Error during inference: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3005)