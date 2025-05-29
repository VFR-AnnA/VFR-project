# Test the Spar3D API with a minimal payload
Write-Host "Testing Spar3D API with minimal payload..."
Write-Host "Sending request to http://localhost:3005/inference..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3005/inference" `
        -Method POST `
        -Body (@{prompt='chair';points=15000;seed=42} | ConvertTo-Json) `
        -ContentType 'application/json'

    Write-Host "`nAPI call successful!" -ForegroundColor Green
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 3 | Write-Host

    # Copy the model to the current directory
    if ($response.model_uri) {
        $fname = Split-Path $response.model_uri -Leaf
        $local = Join-Path $PWD\out $fname
        
        # Ensure out directory exists
        if (-not (Test-Path ".\out")) {
            New-Item -ItemType Directory -Path ".\out" | Out-Null
            Write-Host "Created out directory for model outputs"
        }
        
        if (-not (Test-Path $local)) {
            docker cp spar3d-local:$($response.model_uri) $local
            Write-Host "Model saved to: $local" -ForegroundColor Green
        } else {
            Write-Host "Model already exists at: $local" -ForegroundColor Yellow
        }
        
        # Create a simple HTML viewer for the model
        $htmlContent = @"
<!DOCTYPE html>
<html>
<head>
    <title>3D Model Viewer</title>
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <style>
        body { margin: 0; padding: 0; }
        model-viewer {
            width: 100%;
            height: 100vh;
            background-color: #f5f5f5;
        }
    </style>
</head>
<body>
    <model-viewer src="$local" auto-rotate camera-controls></model-viewer>
</body>
</html>
"@
        
        $htmlContent | Out-File -FilePath "model-viewer.html" -Encoding utf8
        Write-Host "Created model-viewer.html for viewing the model."
        Write-Host "Open model-viewer.html in your browser to view it."
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