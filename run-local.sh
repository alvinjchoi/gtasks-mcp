#!/bin/bash

# Check if .env.local exists
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local..."
  # Export variables from .env.local
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Warning: .env.local file not found. Make sure to set environment variables manually."
fi

# Run the server
echo "Starting Google Tasks MCP Server..."
npm run start 