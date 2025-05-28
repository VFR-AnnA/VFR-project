# Copy the fix script to the container
Write-Host "Copying tets file fix script to the container..."
docker cp fix-tets-file.py spar3d-local:/app/

# Run the fix script
Write-Host "Running the tets file fix script..."
docker exec spar3d-local python3 /app/fix-tets-file.py

# Restart the server
Write-Host "Restarting the server..."
docker exec spar3d-local pkill -f "uvicorn" 2>$null
docker exec -d spar3d-local python3 /app/serve_rest.py

Write-Host "Waiting for the server to start..."
Start-Sleep -Seconds 5

Write-Host "Server is now running with the fixed tets file."
Write-Host "You can test it with:"
Write-Host "curl -X POST http://localhost:3005/inference -H 'Content-Type: application/json' -d '{\"prompt\":\"chair\",\"points\":15000,\"seed\":42}'"
Write-Host "Or visit http://localhost:3005/docs to use the Swagger UI."