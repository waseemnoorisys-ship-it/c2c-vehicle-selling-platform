// // import { createMcpExpressApp } from "@modelcontextprotocol/express";
// import {
//   createMcpExpressApp,
//   mcpAuthMetadataRouter,
// } from "@modelcontextprotocol/express";
// import { toNodeHandler } from "@modelcontextprotocol/node";
// import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";

// import { registerVehicleTools } from "./tools/vehicle.tools.js";
// import { registerVehicleResources } from "./resources/vehicle.resources.js";
// import { registerVehiclePrompts } from "./prompts/vehicle.prompts.js";

// const handler = createMcpHandler(() => {
//   const server = new McpServer({
//     name: "c2c-vehicle-mcp-server",
//     version: "1.0.0",
//   });

//   // VERY IMPORTANT
//   registerVehicleTools(server);
//   registerVehicleResources(server);
//   registerVehiclePrompts(server);

//   return server;
// });

// // const app = createMcpExpressApp();
// const app = createMcpExpressApp({
//   host: "0.0.0.0",
//   allowedHosts: [ "localhost","myth-ceremony-avenging.ngrok-free.dev"],
// });

// const node = toNodeHandler(handler);

// app.all("/mcp", (req, res) => {
//   void node(req, res, req.body);
// });

// app.listen(3001, () => {
//   console.error("C2C Vehicle MCP Server running on port 3001");
// });

import express from "express";
import {
  createMcpExpressApp,
  mcpAuthMetadataRouter,
} from "@modelcontextprotocol/express";

import { toNodeHandler } from "@modelcontextprotocol/node";

import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";

import { registerVehicleTools } from "./tools/vehicle.tools.js";
import { registerVehicleResources } from "./resources/vehicle.resources.js";
import { registerVehiclePrompts } from "./prompts/vehicle.prompts.js";
import oauthRoutes from "./auth/oauth.routes.js";
import { validateAccessToken } from "./auth/oauth.token.service.js";

const handler = createMcpHandler(() => {
  const server = new McpServer({
    name: "c2c-vehicle-mcp-server",
    version: "1.0.0",
  });

  // Register MCP capabilities
  registerVehicleTools(server);
  registerVehicleResources(server);
  registerVehiclePrompts(server);
  return server;
});

const app = createMcpExpressApp({
  host: "0.0.0.0",
  allowedHosts: ["localhost", "myth-ceremony-avenging.ngrok-free.dev"],
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// OAuth routes
app.use("/oauth", oauthRoutes);

// OAuth / MCP Authorization Metadata
app.use(
  mcpAuthMetadataRouter({
    oauthMetadata: {
      issuer: "https://myth-ceremony-avenging.ngrok-free.dev",

      authorization_endpoint:
        "https://myth-ceremony-avenging.ngrok-free.dev/oauth/authorize",

      token_endpoint:
        "https://myth-ceremony-avenging.ngrok-free.dev/oauth/token",

      registration_endpoint:
        "https://myth-ceremony-avenging.ngrok-free.dev/oauth/register",

      response_types_supported: ["code"],

      grant_types_supported: ["authorization_code", "refresh_token"],

      code_challenge_methods_supported: ["S256"],

      scopes_supported: ["read", "write"],
    },

    resourceServerUrl: new URL(
      "https://myth-ceremony-avenging.ngrok-free.dev/mcp",
    ),
  }),
);

// MCP handler
const node = toNodeHandler(handler);

// OAuth protected resource metadata
app.get("/.well-known/oauth-protected-resource", (_req, res) => {
  res.json({
    resource: "https://myth-ceremony-avenging.ngrok-free.dev/mcp",

    authorization_servers: ["https://myth-ceremony-avenging.ngrok-free.dev"],

    scopes_supported: ["read", "write"],
  });
});

// Protected MCP endpoint
app.all("/mcp", (req, res) => {
  try {
    const authorization = req.headers.authorization;

    // No Authorization header
    if (!authorization) {
      return res.status(401).json({
        error: "unauthorized",
        error_description: "Missing Authorization header",
      });
    }

    // Authorization header must use Bearer scheme
    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Authorization header must use Bearer scheme",
      });
    }

    // Extract access token
    const accessToken = authorization.slice("Bearer ".length).trim();

    if (!accessToken) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Access token is missing",
      });
    }

    // Validate access token
    const tokenData = validateAccessToken(accessToken);

    if (!tokenData) {
      return res.status(401).json({
        error: "invalid_token",
        error_description: "Access token is invalid or expired",
      });
    }

    // Token is valid.
    // Continue to MCP handler.
    void node(req, res, req.body);
  } catch (error) {
    console.error("MCP authentication error:", error);

    return res.status(500).json({
      error: "server_error",
      error_description: "MCP authentication failed",
    });
  }
});

app.listen(3001, () => {
  console.error("C2C Vehicle MCP Server running on port 3001");
});










// chatgpt-c2c-client
// https://myth-ceremony-avenging.ngrok-free.dev/mcp

// import "dotenv/config";

// import {
//   createMcpExpressApp,
//   requireBearerAuth,
// } from "@modelcontextprotocol/express";

// import { toNodeHandler } from "@modelcontextprotocol/node";
// import {
//   createMcpHandler,
//   McpServer,
// } from "@modelcontextprotocol/server";

// import { registerVehicleTools } from "./tools/vehicle.tools.js";
// import { registerVehicleResources } from "./resources/vehicle.resources.js";
// import { registerVehiclePrompts } from "./prompts/vehicle.prompts.js";
// import { auth0Verifier } from "./auth/auth0.js";

// const handler = createMcpHandler(() => {
//   const server = new McpServer({
//     name: "c2c-vehicle-mcp-server",
//     version: "1.0.0",
//   });

//   registerVehicleTools(server);
//   registerVehicleResources(server);
//   registerVehiclePrompts(server);

//   return server;
// });

// const app = createMcpExpressApp({
//   host: "0.0.0.0",
//   allowedHosts: [
//     "myth-ceremony-avenging.ngrok-free.dev",
//     "localhost",
//   ],
// });

// const node = toNodeHandler(handler);

// const auth = requireBearerAuth({
//   verifier: auth0Verifier,
//   requiredScopes: ["mcp:read"],
// });

// app.all("/mcp", auth, (req, res) => {
//   void node(req, res, req.body);
// });

// app.listen(3001, () => {
//   console.error(
//     "C2C Vehicle MCP Server running on http://localhost:3001"
//   );
// });
