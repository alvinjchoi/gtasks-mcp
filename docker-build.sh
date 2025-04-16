#!/bin/bash

# Build the Docker image
docker build -t gtasks-mcp .

# Run the container
echo "To run the container with your Google API credentials, use:"
echo "docker run -p 3000:3000 -e GOOGLE_CLIENT_ID=your_client_id -e GOOGLE_CLIENT_SECRET=your_client_secret -e GOOGLE_REFRESH_TOKEN=your_refresh_token gtasks-mcp" 