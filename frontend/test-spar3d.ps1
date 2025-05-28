# Copy an example image to the current directory for testing
Copy-Item -Path "spar3d/demo_files/examples/bird.png" -Destination "demo.png" -Force

# Test the SPAR3D API using curl.exe (the actual curl command, not the PowerShell alias)
curl.exe -X POST http://localhost:3005/generate `
     -F "image=@demo.png" `
     -F "prompt=stone centaur guardian" `
     -o "model.glb"

Write-Host "If model.glb was created successfully, the test passed!"