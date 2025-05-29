# test-spar3d-api.ps1
Write-Host "Testing Spar3D inference..."

# Create the JSON payload with explicit formatting
$jsonPayload = @"
{
    "prompt": "low-poly robot",
    "points": 20000,
    "seed": 123
}
"@

Write-Host "Request payload:"
Write-Host $jsonPayload

# Make the API call with explicit headers
try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3005/inference" `
        -Method POST `
        -Body $jsonPayload `
        -ContentType "application/json" `
        -Headers @{
            "Accept" = "application/json"
        }

    Write-Host "`nAPI call successful!"
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 3 | Write-Host
    
    # Post-mortem logs to check container status
    Write-Host "`nChecking container status:"
    try {
        $containerStatus = docker inspect --format='{{.State.Status}}' spar3d-local
        Write-Host "Container status: $containerStatus"
        
        Write-Host "`nContainer logs (last 50 lines):"
        docker logs --tail 50 spar3d-local
    } catch {
        Write-Host "Error getting container information: $($_.Exception.Message)" -ForegroundColor Red
    }

    # ----- copy model to host and public/models directory -----
    if ($response.model_uri) {
        $fname = Split-Path $response.model_uri -Leaf        # model.glb
        $modelId = "model_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
        $local = Join-Path $PWD\out $fname                   # .\out\model.glb
        $publicModelsDir = Join-Path $PWD "public\models"    # .\public\models
        $publicModelPath = Join-Path $publicModelsDir "$modelId.glb"  # .\public\models\model_20250526_165600.glb
        
        # Ensure out directory exists
        if (-not (Test-Path ".\out")) {
            New-Item -ItemType Directory -Path ".\out" | Out-Null
            Write-Host "Created out directory for model outputs"
        }
        
        # Ensure public/models directory exists
        if (-not (Test-Path $publicModelsDir)) {
            New-Item -ItemType Directory -Path $publicModelsDir -Force | Out-Null
            Write-Host "Created public/models directory for serving models"
        }
        
        # Copy from container to local out directory
        if (-not (Test-Path $local)) {
            docker cp spar3d-local:$($response.model_uri) $local
        }
        Write-Host "Model saved to: $local"
        
        # Copy to public/models directory with unique name
        Copy-Item -Path $local -Destination $publicModelPath -Force
        Write-Host "Model copied to: $publicModelPath"
        Write-Host "Model can be accessed at: /models/$modelId.glb"
        
        # Also try to copy directly from container to public/models
        try {
            docker cp spar3d-local:$($response.model_uri) $publicModelPath
            Write-Host "Model also copied directly from container to public/models"
        } catch {
            Write-Host "Note: Direct container to public/models copy failed, but file was already copied from local out directory"
        }
        
        # Create a simple HTML viewer for the model with relative URL
        $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>3D Model Viewer</title>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        model-viewer {
            width: 100%;
            height: 90vh;
            background-color: #f5f5f5;
        }
        .info {
            padding: 10px;
            background-color: #eee;
            margin-bottom: 10px;
        }
        .model-links {
            display: flex;
            gap: 20px;
            margin-bottom: 10px;
        }
        .model-links a {
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="info">
        <h1>3D Model Viewer</h1>
        <div class="model-links">
            <a href="$local" download>Download Local Model</a>
            <a href="/models/$modelId.glb" download>Download from Server</a>
        </div>
    </div>
    <model-viewer src="/models/$modelId.glb" auto-rotate camera-controls></model-viewer>
</body>
</html>
"@

        $htmlContent | Out-File -FilePath "model-viewer.html" -Encoding utf8
        Write-Host "Created model-viewer.html for viewing the model."
        Write-Host "Open model-viewer.html in your browser to view it."
        Write-Host "Model URL in viewer: /models/$modelId.glb (relative path)"
    }
} catch {
    Write-Host "`nAPI call failed with error:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $responseBody = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($responseBody)
        $responseContent = $reader.ReadToEnd()
        Write-Host "Response content:" -ForegroundColor Red
        Write-Host $responseContent -ForegroundColor Red
    }
}