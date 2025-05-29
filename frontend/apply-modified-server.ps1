# Copy the modified serve_rest.py to the container
Write-Host "Copying modified serve_rest.py to the container..."
docker cp modified_serve_rest.py spar3d-local:/app/serve_rest.py

# Stop the current server process
Write-Host "Stopping the current server process..."
docker exec spar3d-local pkill -f "uvicorn" 2>$null

# Start the server with the modified file
Write-Host "Starting the server with the modified file..."
docker exec -d spar3d-local python3 /app/serve_rest.py

Write-Host "Waiting for the server to start..."
Start-Sleep -Seconds 5

Write-Host "Server is now running with the /inference endpoint."
Write-Host "You can test it with:"
Write-Host "curl -X POST http://localhost:3005/inference -H 'Content-Type: application/json' -d '{\"prompt\":\"chair\",\"points\":15000,\"seed\":42}'"
Write-Host "Or visit http://localhost:3005/docs to use the Swagger UI."