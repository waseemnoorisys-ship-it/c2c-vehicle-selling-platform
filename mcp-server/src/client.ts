import "dotenv/config";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

const client = new Client({
  name: "c2c-vehicle-client",
  version: "2.0.0",
});

const mcpUrl = process.env.MCP_SERVER_URL || "http://localhost:3001/mcp";
const accessToken = process.env.MCP_ACCESS_TOKEN || "";

const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
  requestInit: {
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
  },
});

async function main() {
  console.log(`Connecting to C2C MCP Server at ${mcpUrl}...`);
  await client.connect(transport);
  console.log("Connected to C2C MCP Server!");

  const { tools } = await client.listTools();

  console.log("\nAvailable MCP Tools:");
  for (const tool of tools) {
    console.log(`- ${tool.name}: ${tool.description}`);
  }

  console.log("\nTesting search_vehicles tool...");
  const result = await client.callTool({
    name: "search_vehicles",
    arguments: {
      fuelType: "diesel",
      sort: "price_asc",
      limit: 5,
    },
  });

  console.log("\nTool Result:");
  console.dir(result, { depth: null });

  await client.close();
}

main().catch(console.error);
