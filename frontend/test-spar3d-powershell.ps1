# PowerShell script to test the Spar3D API
Write-Host "Testing Spar3D API with a simple prompt..."
Write-Host "Sending request to http://localhost:3005/inference..."

# 1. JSON-body klaarzetten
$body = @{
    prompt  = "low-poly robot"   # description
    points  = 20000              # number of points
    seed    = 123                # reproducible
} | ConvertTo-Json

# 2. POST-call
$response = Invoke-RestMethod http://localhost:3005/inference `
  -Method POST -Body $body -ContentType 'application/json'

# 3. Display the response
Write-Host "`nAPI test complete. Response:"
$response | ConvertTo-Json

# 4. Extract the model path
$modelPath = $response.model_uri
Write-Host "`nModel generated at: $modelPath"

# 5. Check if the model is available in the local out directory
$localPath = $modelPath -replace "/app/out/", ".\out\"
if (Test-Path $localPath) {
    Write-Host "Model is available locally at: $localPath"
} else {
    Write-Host "Model is not available locally. You can copy it with:"
    Write-Host "docker cp spar3d-local:$modelPath .\out\"
}

# 6. Create a simple HTML viewer for the model
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
    <model-viewer src="$localPath" auto-rotate camera-controls></model-viewer>
</body>
</html>
"@

$htmlContent | Out-File -FilePath "model-viewer.html" -Encoding utf8
Write-Host "`nCreated model-viewer.html for viewing the model."
Write-Host "Open model-viewer.html in your browser to view it."