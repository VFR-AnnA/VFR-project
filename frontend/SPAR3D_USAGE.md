# Spar3D Container Usage Guide

This guide explains how to use the Spar3D container for 3D model generation.

## Prerequisites

- Docker with NVIDIA Container Toolkit installed
- NVIDIA GPU with CUDA support (RTX 4060 or similar)
- At least 34GB of disk space for the container image

## Quick Start

1. Start the container with GPU support:
   ```powershell
   ./run-spar3d-one-liner.ps1
   ```

2. Verify the server is running by opening:
   [http://localhost:3005/docs](http://localhost:3005/docs)

   The Swagger UI shows two available endpoints:
   - POST /generate: One call that generates both points + mesh (experimental)
   - POST /inference: (Most stable) generates only point-cloud + GLB-mesh

3. Test the API with a simple prompt:
   ```powershell
   ./test-spar3d-api.ps1
   ```

## Available Scripts

- `run-spar3d-one-liner.ps1`: One-liner to run the container with all recommended settings
- `run-spar3d-local.ps1`: Starts the container with basic configuration
- `run-spar3d-with-data.ps1`: Starts the container with a data volume mapping for output files
- `fix-spar3d-container.ps1`: Fixes Flet library conflicts if you encounter warnings
- `test-spar3d-api.ps1`: Tests the API with a simple prompt using PowerShell

## API Usage

### Using the `/inference` Endpoint (Text-to-3D)

The `/inference` endpoint allows you to generate 3D models from text prompts:

```powershell
# 1. JSON-body preparation
$payload = @{
    prompt = "low-poly robot"   # description
    points = 20000              # number of points
    seed   = 123                # reproducible
} | ConvertTo-Json -Compress

# 2. POST-call
$response = Invoke-RestMethod `
    -Uri  http://localhost:3005/inference `
    -Method POST `
    -Body $payload `
    -ContentType 'application/json'   # <-- essential!
```

Expected response:
```json
{
  "model_uri": "/app/out/20240526_145901/model.glb",
  "points": 20000,
  "seed": 123
}
```

The `model_uri` points to the GLB file inside the container. Because you've mounted `-v ${PWD}\out:/app/out`, the model is also available locally in the `.\out` directory.

### Using the `/generate` Endpoint (Image-to-3D)

The `/generate` endpoint requires an image file upload:

```
# Using Swagger UI at http://localhost:3005/docs
1. Open the Swagger UI
2. Find the `/generate` endpoint
3. Click "Try it out"
4. Upload an image file
5. Optionally enter a prompt
6. Click "Execute"
```

### Retrieving Generated Models

If you've mounted the output directory with `-v ${PWD}\out:/app/out`, the models will be available in your local `out` directory.

Alternatively, you can copy the model from the container:

```powershell
# Extract the filename from the path
$fname = Split-Path $response.model_uri -Leaf        # model.glb
$local = Join-Path $PWD\out $fname                   # .\out\model.glb

# Copy the file if it doesn't exist locally
if (-not (Test-Path $local)) {
    docker cp spar3d-local:$response.model_uri $local
}
```

### Viewing Generated Models

The `test-spar3d-api.ps1` script creates a simple HTML viewer (`model-viewer.html`) that you can use to view the generated models in your browser.

## Common Issues and Solutions

### Empty module name error

This error occurs when the request body is empty or incorrectly formatted. Make sure to:
- Use the correct content type: `-ContentType 'application/json'`
- Format the JSON properly: `| ConvertTo-Json -Compress`

### 404 Not Found on /inference

- Use POST method and check in Swagger if your URL is correct
- Verify the container is running: `docker ps -a`
- Check if the container is running on a different port

### transparent-background conflicts with flet version

- Run the fix script: `./fix-spar3d-container.ps1`
- Or inside the container: `pip install -U 'flet>=0.23.1,<0.26'`

### CUDA driver not detected

1. Docker Desktop → Settings → Features in development → Enable GPU-backed inference
2. Check `nvidia-smi` in WSL
3. Windows: Use WSL 2 + `wsl --update`, then `winget install nvidia-container-toolkit` and restart

### Port 3005 already in use

Change the host port in the run command:
```powershell
docker run --name spar3d-local -p 3010:3005 --gpus all -v ${PWD}\out:/app/out spar3d:cuda12-fixed
```

Then access Swagger at http://localhost:3010/docs and update your API calls to use the new port.

### Memory pressure (image ~34 GB)

1. In Docker Desktop → Resources, increase WSL disk size
2. Turn off Resource Saver
3. Clean up old layers: `docker system prune -a`

## Stopping the Container

```powershell
docker stop spar3d-local    # or CTRL+C in your PowerShell window
# Because you used --rm, it will be automatically removed after stopping
```

## Integration with Next.js Frontend

The frontend has been updated to support SPAR3D as a provider option. When SPAR3D is selected, the UI automatically switches to image-to-3D mode only, as the text-to-3D endpoint is currently disabled.

### Frontend Implementation

1. **Provider Selection**: The UI includes a "Local (SPAR3D)" option in the provider dropdown.
2. **Automatic Mode Switching**: When SPAR3D is selected, the UI automatically switches to image-only mode.
3. **UI Adaptation**: The text prompt field is hidden when in image-only mode.

### Code Structure

- `app/hooks/useGeneratorSettingsStore.ts`: Manages provider and mode selection with automatic mode switching for SPAR3D
- `lib/generate.ts`: Routes generation requests to the appropriate provider API
- `lib/ai/spar3d.ts`: Handles communication with the SPAR3D API

### Usage

1. Select "Local (SPAR3D)" from the provider dropdown
2. Upload an image (text prompt will be hidden)
3. Click "Generate Model"

The system will use the `/generate` endpoint for image-to-3D conversion, avoiding the `/inference` endpoint until upstream fixes are available.