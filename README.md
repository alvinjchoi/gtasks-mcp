# Google Tasks MCP Server

A Model Context Protocol (MCP) server for Google Tasks integration in Claude Desktop. This server enables AI assistants to manage Google Tasks through natural language interactions.

![](https://badge.mcpx.dev?type=server "MCP Server")
[![npm version](https://badge.fury.io/js/@alvincrave/gtasks-mcp.svg)](https://www.npmjs.com/package/@alvincrave/gtasks-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Smithery](https://smithery.ai/badge.svg)](https://smithery.ai/server/@alvinjchoi/gtasks-mcp)

## Features

- List all tasks in your Google Tasks lists
- Search for specific tasks by query
- Create new tasks with title, notes, and due date
- Update existing tasks (title, notes, status, due date)
- Delete tasks
- Clear completed tasks from a task list
- Full integration with Google Tasks API
- Secure OAuth2 authentication
- Docker support for containerized deployment

## Installation

### Installing via Smithery

To install Google Tasks Integration for Claude Desktop automatically:

```bash
npx -y @smithery/cli install @alvincrave/gtasks-mcp --client claude
```

### Manual Installation

```bash
npm install @alvincrave/gtasks-mcp
```

## Setup

1. Create a Google Cloud Project and obtain credentials:

   a. Create a Google Cloud Project:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Tasks API for your project

   b. Create OAuth 2.0 Credentials:

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Desktop app" as application type
   - Give it a name and click "Create"
   - You will get your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

   c. Get Refresh Token:

   - Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Click the gear icon (Settings) in the top right
   - Check "Use your own OAuth credentials"
   - Enter your OAuth Client ID and Client Secret
   - In the left panel, find "Tasks API v1" and select "https://www.googleapis.com/auth/tasks"
   - Click "Authorize APIs" and complete the OAuth flow
   - Click "Exchange authorization code for tokens"
   - Copy the "Refresh token" - this is your `GOOGLE_REFRESH_TOKEN`

2. Configure in Claude Desktop:

```json
{
  "mcpServers": {
    "gtasks": {
      "command": "npx",
      "args": ["-y", "@alvincrave/gtasks-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id_here",
        "GOOGLE_CLIENT_SECRET": "your_client_secret_here",
        "GOOGLE_REFRESH_TOKEN": "your_refresh_token_here"
      },
      "connectionTypes": ["stdio"],
      "autoRestart": true
    }
  }
}
```

## Docker Support

You can run this server in a Docker container:

```bash
# Build the Docker image
docker build -t gtasks-mcp .

# Run the container
docker run -p 3000:3000 \
  -e GOOGLE_CLIENT_ID=your_client_id \
  -e GOOGLE_CLIENT_SECRET=your_client_secret \
  -e GOOGLE_REFRESH_TOKEN=your_refresh_token \
  gtasks-mcp
```

## Usage Examples

The server provides several tools that can be used through Claude Desktop:

### Search Tasks

```
search for tasks containing "meeting"
```

### List Tasks

```
show me all my tasks
```

### Create Task

```
create a task to "Prepare presentation" due on Friday
```

### Update Task

```
mark the "Send email" task as completed
```

### Delete Task

```
delete the task about "old project"
```

### Clear Completed Tasks

```
clear all completed tasks from my list
```

## Security Notes

- Keep your Google API credentials secure
- Regularly rotate your refresh tokens
- Store sensitive information in Claude Desktop configuration
- Never share or commit your credentials to version control
- The refresh token gives access to your Google Tasks, treat it like a password

## License

This project is licensed under the MIT License.
