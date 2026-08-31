import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";

export function registerVehiclePrompts(server: McpServer) {
  server.registerPrompt(
    "vehicle_price_analysis",
    {
      title: "Vehicle Price Analysis",
      description:
        "Analyze whether a vehicle's asking price is reasonable.",
      argsSchema: {
        vehicleId: z.string(),
      },
    },
    async ({ vehicleId }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Analyze the asking price of vehicle ${vehicleId}.

Consider:
- Vehicle age
- Fuel type
- Location
- Asking price
- Overall value

Give a concise buying recommendation.`,
            },
          },
        ],
      };
    }
  );
}