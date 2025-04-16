# Google Tasks MCP Server

> **Note**: This repository is a fork of the original Google Tasks MCP Server with additional Docker support for easier deployment and containerization.

This MCP server integrates with Google Tasks to allow listing, reading, searching, creating, updating, and deleting tasks.

## Updates in this Fork

This fork adds the following improvements to the original repository:

- **Docker Support**: Added complete Docker configuration for containerized deployment
- **Simplified Deployment**: Created a build script (`docker-build.sh`) for easy building and running
- **Environment Variables**: Enhanced support for passing Google API credentials via environment variables
- **Code Cleanup**: Removed test files and improved the repository structure

## Running with Docker

You can build and run this server as a Docker container:

```bash
# Build the Docker image
./docker-build.sh

# Run the container with your Google API credentials
docker run -p 3000:3000 \
  -e GOOGLE_CLIENT_ID=your_client_id \
  -e GOOGLE_CLIENT_SECRET=your_client_secret \
  -e GOOGLE_REFRESH_TOKEN=your_refresh_token \
  gtasks-mcp
```

## Components

### Tools

- **search**

  - Search for tasks in Google Tasks
  - Input: `query` (string): Search query
  - Returns matching tasks with details

- **list**

  - List all tasks in Google Tasks
  - Optional input: `cursor` (string): Cursor for pagination
  - Returns a list of all tasks

- **create**

  - Create a new task in Google Tasks
  - Input:
    - `taskListId` (string, optional): Task list ID
    - `title` (string, required): Task title
    - `notes` (string, optional): Task notes
    - `due` (string, optional): Due date
  - Returns confirmation of task creation

- **update**

  - Update an existing task in Google Tasks
  - Input:
    - `taskListId` (string, optional): Task list ID
    - `id` (string, required): Task ID
    - `uri` (string, required): Task URI
    - `title` (string, optional): New task title
    - `notes` (string, optional): New task notes
    - `status` (string, optional): New task status ("needsAction" or "completed")
    - `due` (string, optional): New due date
  - Returns confirmation of task update

- **delete**

  - Delete a task in Google Tasks
  - Input:
    - `taskListId` (string, required): Task list ID
    - `id` (string, required): Task ID
  - Returns confirmation of task deletion

- **clear**
  - Clear completed tasks from a Google Tasks task list
  - Input: `taskListId` (string, required): Task list ID
  - Returns confirmation of cleared tasks

### Resources

The server provides access to Google Tasks resources:

- **Tasks** (`gtasks:///<task_id>`)
  - Represents individual tasks in Google Tasks
  - Supports reading task details including title, status, due date, notes, and other metadata
  - Can be listed, read, created, updated, and deleted using the provided tools

## Getting started

1. [Create a new Google Cloud project](https://console.cloud.google.com/projectcreate)
2. [Enable the Google Tasks API](https://console.cloud.google.com/workspace-api/products)
3. [Configure an OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) ("internal" is fine for testing)
4. Add scopes `https://www.googleapis.com/auth/tasks`
5. [Create an OAuth Client ID](https://console.cloud.google.com/apis/credentials/oauthclient) for application type "Desktop App"
6. Download the JSON file of your client's OAuth keys
7. Rename the key file to `gcp-oauth.keys.json` and place into the root of this repo (i.e. `gcp-oauth.keys.json`)

Make sure to build the server with either `npm run build` or `npm run watch`.

### Important Note for Smithery Users

When using this server with Smithery deployment, you **must** provide the following configuration parameters:

- `googleClientId`: Your Google API Client ID
- `googleClientSecret`: Your Google API Client Secret
- `googleRefreshToken`: A valid refresh token for Google API

The server will list tools without these credentials, but will require them when actually calling the tools.

### Installing via Smithery

To install Google Tasks Server on your Smithery instance:

```bash
npx -y @smithery/cli install @alvinjchoi/gtasks-mcp --client claude
```

### Authentication

To authenticate and save credentials:

1. Run the server with the `auth` argument: `npm run start auth`
2. This will open an authentication flow in your system browser
3. Complete the authentication process
4. Credentials will be saved in the root of this repo (i.e. `.gdrive-server-credentials.json`)

#### Alternative: Using Environment Variables

Instead of going through the authentication flow, you can directly provide Google API credentials via environment variables:

- `GOOGLE_CLIENT_ID`: Your Google API Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google API Client Secret
- `GOOGLE_REFRESH_TOKEN`: A valid refresh token for Google API

With these environment variables set, the server will use them directly instead of looking for credential files.

#### Using .env.local for Local Development

For local development, you can create a `.env.local` file in the project root with your credentials:

```
# Google Tasks API Credentials
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
```

Then use the included script to run the server with these credentials:

```bash
./run-local.sh
```

This script will automatically load the environment variables from `.env.local` and start the server.

### Usage with Desktop App

To integrate this server with the desktop app, add the following to your app's server configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gtasks": {
      "command": "npx",
      "args": ["@alvinjchoi/gtasks-mcp"],
      "env": {
        "GOOGLE_CLIENT_ID": "YOUR_GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET": "YOUR_GOOGLE_CLIENT_SECRET",
        "GOOGLE_REFRESH_TOKEN": "YOUR_GOOGLE_REFRESH_TOKEN"
      }
    }
  }
}
```

Replace the values with your actual Google API credentials.

## Original Repository

This is a fork of the original Google Tasks MCP Server. Credit goes to the original author for creating the integration with Google Tasks API and the Model Context Protocol.

## License

This project is licensed under the same terms as the original repository.
