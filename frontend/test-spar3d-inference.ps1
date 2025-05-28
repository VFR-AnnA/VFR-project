# Test the Spar3D API with a simple prompt using the /inference endpoint
Write-Host "Testing Spar3D API with a simple prompt..."
Write-Host "Sending request to http://localhost:3005/inference..."

$response = Invoke-WebRequest -Method POST -Uri "http://localhost:3005/inference" `
    -Headers @{"Content-Type"="application/json"} `
    -Body '{"prompt":"low-poly robot","points":20000,"seed":123}'

Write-Host "`nAPI test complete. Response:"
$responseContent = $response.Content | ConvertFrom-Json
$responseContent | ConvertTo-Json

Write-Host "`nTo copy the generated model to your current directory:"
Write-Host "docker cp spar3d-local:$($responseContent.model_uri) ."

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
    <model-viewer src="./model.glb" auto-rotate camera-controls></model-viewer>
</body>
</html>
"@

$htmlContent | Out-File -FilePath "model-viewer.html" -Encoding utf8
Write-Host "`nCreated model-viewer.html for viewing the model."
Write-Host "After copying the model, open model-viewer.html in your browser to view it."