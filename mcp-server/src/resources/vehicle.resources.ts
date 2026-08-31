import { McpServer } from "@modelcontextprotocol/server";

export function registerVehicleResources(server: McpServer) {
  server.registerResource(
    "vehicle-details",
    "vehicle://V001",
    {
      title: "Toyota Fortuner V001",
      description: "Details of vehicle V001",
      mimeType: "application/json",
    },
    async (uri) => {
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({
              id: "V001",
              make: "Toyota",
              model: "Fortuner",
              year: 2022,
              price: 1950000,
              fuelType: "diesel",
              city: "Hyderabad",
            }),
          },
        ],
      };
    }
  );
}