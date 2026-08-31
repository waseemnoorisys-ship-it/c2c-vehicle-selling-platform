import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";

const client = new Client({
  name: "c2c-vehicle-client",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:3001/mcp"),
);

async function main() {
  await client.connect(transport);

  console.log("Connected to C2C MCP Server");

  const { tools } = await client.listTools();

  console.log("\nAvailable tools:");

  for (const tool of tools) {
    console.log(`- ${tool.name}: ${tool.description}`);
  }

  const result = await client.callTool({
    name: "search_vehicles",
    arguments: {
      fuelType: "diesel",
      city: "Hyderabad",
    },
  });

  console.log("\nTool result:");
  console.dir(result, { depth: null });

  await client.close();
}

main().catch(console.error);
