#!/bin/bash

# Check if .env.local exists
if [ -f .env.local ]; then
  echo "Loading environment variables from .env.local..."
  # Export variables from .env.local
  export $(grep -v '^#' .env.local | xargs)
else
  echo "Warning: .env.local file not found. Make sure to set environment variables manually."
fi

# Add production environment to prevent debug messages from interfering with JSON output
export NODE_ENV=production

# Optional: Uncomment for debug logging to a file instead of stdout
# export DEBUG_TO_FILE=true

# Run the server
echo "Starting Google Tasks MCP Server..."
node dist/index.js 