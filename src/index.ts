#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import { google, tasks_v1 } from "googleapis";
import path from "path";
import { OAuth2Client } from "google-auth-library";
import { TaskActions, TaskResources } from "./Tasks.js";

// OAuth2 credentials from environment variables
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const REDIRECT_URI = "http://localhost";

// Define path for file-based credentials
const credentialsPath = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  "../.gtasks-server-credentials.json"
);

// Initialize auth client and Google Tasks API
let oauth2Client: OAuth2Client | null = null;
let tasks: tasks_v1.Tasks | null = null;
let isAuthenticated = false;

// Set up the server
const server = new Server(
  {
    name: "gtasks-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Function to authenticate and initialize the Google Tasks API
async function initializeAuth() {
  if (isAuthenticated) return true;

  try {
    // Initialize OAuth client - first try environment variables
    if (CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
      console.log("Using credentials from environment variables");
      oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
      oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    } else {
      // Fall back to file-based credentials
      if (!fs.existsSync(credentialsPath)) {
        console.error(
          "Credentials not found and environment variables not set. Please either:\n" +
            "1. Run with 'auth' argument first to create credentials file, or\n" +
            "2. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN environment variables."
        );
        return false;
      }

      console.log("Using credentials from file");
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));
      oauth2Client = new OAuth2Client();
      oauth2Client.setCredentials(credentials);
    }

    // Initialize Google Tasks API
    tasks = google.tasks({ version: "v1", auth: oauth2Client });
    isAuthenticated = true;
    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}

// Handle listing resources (tasks)
server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
  // Authenticate first
  if (!(await initializeAuth())) {
    return {
      resources: [],
      error:
        "Authentication required. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.",
    };
  }

  const [allTasks, nextPageToken] = await TaskResources.list(request, tasks!);
  return {
    resources: allTasks.map((task) => ({
      uri: `gtasks:///${task.id}`,
      mimeType: "text/plain",
      name: task.title,
    })),
    nextCursor: nextPageToken,
  };
});

// Handle reading a specific task
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  // Authenticate first
  if (!(await initializeAuth())) {
    return {
      contents: [
        {
          uri: request.params.uri,
          mimeType: "text/plain",
          text: "Authentication required. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.",
        },
      ],
    };
  }

  const task = await TaskResources.read(request, tasks!);

  const taskDetails = [
    `Title: ${task.title || "No title"}`,
    `Status: ${task.status || "Unknown"}`,
    `Due: ${task.due || "Not set"}`,
    `Notes: ${task.notes || "No notes"}`,
    `Hidden: ${task.hidden || "Unknown"}`,
    `Parent: ${task.parent || "Unknown"}`,
    `Deleted?: ${task.deleted || "Unknown"}`,
    `Completed Date: ${task.completed || "Unknown"}`,
    `Position: ${task.position || "Unknown"}`,
    `ETag: ${task.etag || "Unknown"}`,
    `Links: ${task.links || "Unknown"}`,
    `Kind: ${task.kind || "Unknown"}`,
    `Status: ${task.status || "Unknown"}`,
    `Created: ${task.updated || "Unknown"}`,
    `Updated: ${task.updated || "Unknown"}`,
  ].join("\n");

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "text/plain",
        text: taskDetails,
      },
    ],
  };
});

// Handle listing available tools - no authentication required
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search",
        description: "Search for a task in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Search query",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "list",
        description: "List all tasks in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            cursor: {
              type: "string",
              description: "Cursor for pagination",
            },
          },
        },
      },
      {
        name: "create",
        description: "Create a new task in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            taskListId: {
              type: "string",
              description: "Task list ID",
            },
            title: {
              type: "string",
              description: "Task title",
            },
            notes: {
              type: "string",
              description: "Task notes",
            },
            due: {
              type: "string",
              description: "Due date",
            },
          },
          required: ["title"],
        },
      },
      {
        name: "clear",
        description: "Clear completed tasks from a Google Tasks task list",
        inputSchema: {
          type: "object",
          properties: {
            taskListId: {
              type: "string",
              description: "Task list ID",
            },
          },
          required: ["taskListId"],
        },
      },
      {
        name: "delete",
        description: "Delete a task in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            taskListId: {
              type: "string",
              description: "Task list ID",
            },
            id: {
              type: "string",
              description: "Task id",
            },
          },
          required: ["id", "taskListId"],
        },
      },
      {
        name: "update",
        description: "Update a task in Google Tasks",
        inputSchema: {
          type: "object",
          properties: {
            taskListId: {
              type: "string",
              description: "Task list ID",
            },
            id: {
              type: "string",
              description: "Task ID",
            },
            uri: {
              type: "string",
              description: "Task URI",
            },
            title: {
              type: "string",
              description: "Task title",
            },
            notes: {
              type: "string",
              description: "Task notes",
            },
            status: {
              type: "string",
              enum: ["needsAction", "completed"],
              description: "Task status (needsAction or completed)",
            },
            due: {
              type: "string",
              description: "Due date",
            },
          },
          required: ["id", "uri"],
        },
      },
    ],
  };
});

// Handle tool call requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    // Authenticate first
    if (!(await initializeAuth())) {
      return {
        content: [
          {
            type: "text",
            text: "Authentication required. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN.",
          },
        ],
        isError: true,
      };
    }

    if (request.params.name === "search") {
      const taskResult = await TaskActions.search(request, tasks!);
      return taskResult;
    }
    if (request.params.name === "list") {
      const taskResult = await TaskActions.list(request, tasks!);
      return taskResult;
    }
    if (request.params.name === "create") {
      const taskResult = await TaskActions.create(request, tasks!);
      return taskResult;
    }
    if (request.params.name === "update") {
      const taskResult = await TaskActions.update(request, tasks!);
      return taskResult;
    }
    if (request.params.name === "delete") {
      const taskResult = await TaskActions.delete(request, tasks!);
      return taskResult;
    }
    if (request.params.name === "clear") {
      const taskResult = await TaskActions.clear(request, tasks!);
      return taskResult;
    }
    throw new Error("Tool not found");
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

// Function to authenticate using the OAuth2 flow and save credentials
async function authenticateAndSaveCredentials() {
  console.log("Launching auth flow…");
  const p = path.join(
    path.dirname(new URL(import.meta.url).pathname),
    "../gcp-oauth.keys.json"
  );

  console.log(p);
  const { authenticate } = await import("@google-cloud/local-auth");
  const auth = await authenticate({
    keyfilePath: p,
    scopes: ["https://www.googleapis.com/auth/tasks"],
  });
  fs.writeFileSync(credentialsPath, JSON.stringify(auth.credentials));
  console.log("Credentials saved. You can now run the server.");
}

// Main function to initialize and start the server
async function initializeAndRunServer() {
  // Check if we're in auth mode
  if (process.argv[2] === "auth") {
    await authenticateAndSaveCredentials().catch(console.error);
    return;
  }

  // Start the server without initializing authentication
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Google Tasks MCP Server running on stdio");
}

// Run the server
initializeAndRunServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
