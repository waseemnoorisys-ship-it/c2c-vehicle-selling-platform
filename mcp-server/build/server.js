import "dotenv/config";
import express from "express";
import { createMcpExpressApp, mcpAuthMetadataRouter, requireBearerAuth, } from "@modelcontextprotocol/express";
import { toNodeHandler } from "@modelcontextprotocol/node";
import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { connectDB } from "./db.js";
import { registerVehicleTools } from "./tools/vehicle.tools.js";
import { registerVehicleResources } from "./resources/vehicle.resources.js";
import { registerVehiclePrompts } from "./prompts/vehicle.prompts.js";
import oauthRoutes from "./auth/oauth.routes.js";
import { tokenVerifier } from "./auth/oauth.token.service.js";
import { registerPaymentTools } from "./tools/payment.tools.js";
// ============================================================
// Initialize MongoDB Connection for MCP Persistence
// ============================================================
await connectDB();
// ============================================================
// Create MCP Server Handler (SDK v2)
// ============================================================
const handler = createMcpHandler(() => {
    const server = new McpServer({
        name: "c2c-vehicle-mcp-server",
        version: "2.0.0",
    });
    // Register MCP capabilities
    registerVehicleTools(server);
    registerVehicleResources(server);
    registerVehiclePrompts(server);
    registerPaymentTools(server);
    return server;
});
const node = toNodeHandler(handler);
// Resolve public URL for OAuth metadata discovery
const publicBaseUrl = process.env.MCP_PUBLIC_URL ||
    (process.env.RENDER_EXTERNAL_HOSTNAME
        ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
        : "http://localhost:3001");
let publicHost;
try {
    publicHost = new URL(publicBaseUrl).hostname;
}
catch {
    publicHost = undefined;
}
const renderHost = process.env.RENDER_EXTERNAL_HOSTNAME;
const allowedHosts = [
    "localhost",
    "127.0.0.1",
    "myth-ceremony-avenging.ngrok-free.dev",
    ...(publicHost ? [publicHost] : []),
    ...(renderHost ? [renderHost] : []),
];
const app = createMcpExpressApp({
    host: "0.0.0.0",
    allowedHosts,
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// ============================================================
// Mount OAuth 2.1 Routes
// ============================================================
app.use("/oauth", oauthRoutes);
// ============================================================
// MCP / OAuth Authorization Server & Protected Resource Metadata
// RFC 8414 & RFC 9728
// ============================================================
app.use(mcpAuthMetadataRouter({
    oauthMetadata: {
        issuer: publicBaseUrl,
        authorization_endpoint: `${publicBaseUrl}/oauth/authorize`,
        token_endpoint: `${publicBaseUrl}/oauth/token`,
        registration_endpoint: `${publicBaseUrl}/oauth/register`,
        response_types_supported: ["code"],
        grant_types_supported: ["authorization_code"],
        code_challenge_methods_supported: ["S256"],
        scopes_supported: ["read", "write"],
    },
    resourceServerUrl: new URL(`${publicBaseUrl}/mcp`),
}));
// ============================================================
// Protected MCP Endpoint (Bearer Token Authentication)
// ============================================================
const auth = requireBearerAuth({
    verifier: tokenVerifier,
    resourceMetadataUrl: `${publicBaseUrl}/.well-known/oauth-protected-resource`,
});
app.all("/mcp", auth, (req, res) => {
    void node(req, res, req.body);
});
// ============================================================
// Server Status / Health Check
// ============================================================
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        server: "c2c-vehicle-mcp-server",
        protocol: "mcp-v2",
        endpoint: `${publicBaseUrl}/mcp`,
        oauth_issuer: publicBaseUrl,
    });
});
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
    console.error(`C2C Vehicle MCP Server running on port ${PORT}`);
    console.error(`MCP Endpoint: ${publicBaseUrl}/mcp`);
    console.error(`OAuth Authorize: ${publicBaseUrl}/oauth/authorize`);
});
