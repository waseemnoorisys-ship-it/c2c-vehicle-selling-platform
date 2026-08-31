// import { config } from "dotenv";
import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  c2cAuthenticatedFetch,
} from "../auth/c2c-auth.service.js";

export function registerVehicleTools(server: McpServer) {
  // ============================================================
  // Search Vehicles
  // ============================================================

  server.registerTool(
    "search_vehicles",
    {
      title: "Search Vehicles",

      description:
        "Search approved vehicles available on the C2C vehicle marketplace.",

      inputSchema: z.object({
        search: z.string().optional(),
        makeId: z.string().optional(),
        modelId: z.string().optional(),

        minYear: z.number().optional(),
        maxYear: z.number().optional(),

        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),

        fuelType: z.string().optional(),
        transmission: z.string().optional(),
        condition: z.string().optional(),

        latitude: z.number().optional(),
        longitude: z.number().optional(),
        radius: z.number().optional(),

        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),

        sort: z
          .enum([
            "newest",
            "oldest",
            "price_asc",
            "price_desc",
            "most_viewed",
          ])
          .optional(),

        page: z.number().optional(),
        limit: z.number().optional(),
      }),
    },

    async (filters) => {
      try {
        const response = await fetch(
          "https://c2c-vehicle-selling-platform.onrender.com/api/v1/listings/browse",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(filters),
          },
        );

        if (!response.ok) {
          return {
            content: [
              {
                type: "text",
                text: `Vehicle API returned HTTP ${response.status}`,
              },
            ],
            isError: true,
          };
        }

        const data = await response.json();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to search vehicles: ${
                error instanceof Error
                  ? error.message
                  : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    },
  );


  // ============================================================
  // Get Vehicle Details
  // ============================================================

  server.registerTool(
    "get_vehicle_details",
    {
      title: "Get Vehicle Details",

      description:
        "Get complete details of a specific approved vehicle listing using its listing ID.",

      inputSchema: z.object({
        listingId: z
          .string()
          .describe(
            "The unique ID of the vehicle listing",
          ),
      }),
    },

    async ({ listingId }) => {
      try {
        const response = await fetch(
          "https://c2c-vehicle-selling-platform.onrender.com/api/v1/listings/get",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              id: listingId,
            }),
          },
        );

        if (!response.ok) {
          return {
            content: [
              {
                type: "text",
                text: `Vehicle API returned HTTP ${response.status}`,
              },
            ],
            isError: true,
          };
        }

        const data = await response.json();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Failed to get vehicle details: ${
                error instanceof Error
                  ? error.message
                  : "Unknown error"
              }`,
            },
          ],
          isError: true,
        };
      }
    },
  );


  // ============================================================
  // Create Vehicle Offer
  // ============================================================

  server.registerTool(
    "offer_create",
    {
      title: "Create Vehicle Offer",

      description:
        "Create a purchase offer for a vehicle listing on the C2C marketplace.",

      inputSchema: z.object({
        listingId: z
          .string()
          .regex(
            /^[a-fA-F0-9]{24}$/,
            "listingId must be a valid MongoDB ObjectId",
          )
          .describe(
            "The MongoDB ObjectId of the vehicle listing",
          ),

        amount: z
          .number()
          .int()
          .min(1)
          .describe(
            "Offer amount in the backend's smallest currency unit",
          ),

        message: z
          .string()
          .trim()
          .max(500)
          .optional()
          .describe(
            "Optional message to the vehicle seller",
          ),
      }),
    },

    async ({
      listingId,
      amount,
      message,
    }) => {
      try {
        // --------------------------------------------------------
        // Read buyer JWT from MCP server environment
        // --------------------------------------------------------

        const accessToken =
          process.env.C2C_ACCESS_TOKEN;

        if (!accessToken) {
          return {
            content: [
              {
                type: "text",

                text:
                  "C2C_ACCESS_TOKEN is not configured in the MCP server environment.",
              },
            ],

            isError: true,
          };
        }


        // --------------------------------------------------------
        // Call C2C backend
        // --------------------------------------------------------

        const response =
          await fetch(
            "https://c2c-vehicle-selling-platform.onrender.com/api/v1/offers/create",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${accessToken}`,
              },

              body: JSON.stringify({
                listingId,

                amount,

                ...(message
                  ? {
                      message,
                    }
                  : {}),
              }),
            },
          );


        // --------------------------------------------------------
        // Parse backend response safely
        // --------------------------------------------------------

        const data =
          await response.json();


        // --------------------------------------------------------
        // Backend error
        // --------------------------------------------------------

        if (!response.ok) {
          return {
            content: [
              {
                type: "text",

                text:
                  JSON.stringify(
                    {
                      success: false,

                      status:
                        response.status,

                      error:
                        data,
                    },

                    null,
                    2,
                  ),
              },
            ],

            isError: true,
          };
        }


        // --------------------------------------------------------
        // Success
        // --------------------------------------------------------

        return {
          content: [
            {
              type: "text",

              text:
                JSON.stringify(
                  data,
                  null,
                  2,
                ),
            },
          ],
        };

      } catch (error) {
        return {
          content: [
            {
              type: "text",

              text:
                `Failed to create vehicle offer: ${
                  error instanceof Error
                    ? error.message
                    : "Unknown error"
                }`,
            },
          ],

          isError: true,
        };
      }
    },
  );



  // ============================================================
  // Get Offer Details
  // ============================================================

  server.registerTool(
    "offer_get",
    {
      title: "Get Offer Details",

      description:
        "Get the details and current status of a vehicle offer from the C2C marketplace.",

      inputSchema: z.object({
        id: z
          .string()
          .regex(
            /^[a-fA-F0-9]{24}$/,
            "Offer id must be a valid MongoDB ObjectId",
          )
          .describe(
            "The MongoDB ObjectId of the offer",
          ),
      }),
    },

    async ({ id }) => {
      try {
        // --------------------------------------------------------
        // Read buyer JWT from MCP server environment
        // --------------------------------------------------------

        const accessToken =
          process.env.C2C_ACCESS_TOKEN;

        if (!accessToken) {
          return {
            content: [
              {
                type: "text",

                text:
                  "C2C_ACCESS_TOKEN is not configured in the MCP server environment.",
              },
            ],

            isError: true,
          };
        }


        // --------------------------------------------------------
        // Call C2C backend
        // --------------------------------------------------------

        const response =
          await fetch(
            "https://c2c-vehicle-selling-platform.onrender.com/api/v1/offers/get",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${accessToken}`,
              },

              body: JSON.stringify({
                id,
              }),
            },
          );


        // --------------------------------------------------------
        // Parse backend response
        // --------------------------------------------------------

        const data =
          await response.json();


        // --------------------------------------------------------
        // Backend error
        // --------------------------------------------------------

        if (!response.ok) {
          return {
            content: [
              {
                type: "text",

                text:
                  JSON.stringify(
                    {
                      success: false,

                      status:
                        response.status,

                      error:
                        data,
                    },

                    null,
                    2,
                  ),
              },
            ],

            isError: true,
          };
        }


        // --------------------------------------------------------
        // Success
        // --------------------------------------------------------

        return {
          content: [
            {
              type: "text",

              text:
                JSON.stringify(
                  data,
                  null,
                  2,
                ),
            },
          ],
        };

      } catch (error) {
        return {
          content: [
            {
              type: "text",

              text:
                `Failed to get offer details: ${
                  error instanceof Error
                    ? error.message
                    : "Unknown error"
                }`,
            },
          ],

          isError: true,
        };
      }
    },
  );



  // ============================================================
  // Get My Offers
  // ============================================================

  server.registerTool(
    "offer_mine",
    {
      title: "Get My Offers",

      description:
        "Get the authenticated buyer's vehicle offers from the C2C marketplace.",

      inputSchema: z.object({
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe(
            "Page number. Defaults to 1.",
          ),

        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe(
            "Number of offers to return. Maximum 50.",
          ),
      }),
    },

    async ({
      page,
      limit,
    }) => {
      try {
        // --------------------------------------------------------
        // Read buyer JWT from MCP server environment
        // --------------------------------------------------------

        const accessToken =
          process.env.C2C_ACCESS_TOKEN;

        if (!accessToken) {
          return {
            content: [
              {
                type: "text",

                text:
                  "C2C_ACCESS_TOKEN is not configured in the MCP server environment.",
              },
            ],

            isError: true,
          };
        }


        // --------------------------------------------------------
        // Call C2C backend
        // --------------------------------------------------------

        const response =
          await fetch(
            "https://c2c-vehicle-selling-platform.onrender.com/api/v1/offers/mine",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${accessToken}`,
              },

              body: JSON.stringify({
                ...(page !== undefined
                  ? { page }
                  : {}),

                ...(limit !== undefined
                  ? { limit }
                  : {}),
              }),
            },
          );


        // --------------------------------------------------------
        // Parse backend response
        // --------------------------------------------------------

        const data =
          await response.json();


        // --------------------------------------------------------
        // Backend error
        // --------------------------------------------------------

        if (!response.ok) {
          return {
            content: [
              {
                type: "text",

                text:
                  JSON.stringify(
                    {
                      success: false,

                      status:
                        response.status,

                      error:
                        data,
                    },

                    null,
                    2,
                  ),
              },
            ],

            isError: true,
          };
        }


        // --------------------------------------------------------
        // Success
        // --------------------------------------------------------

        return {
          content: [
            {
              type: "text",

              text:
                JSON.stringify(
                  data,
                  null,
                  2,
                ),
            },
          ],
        };

      } catch (error) {
        return {
          content: [
            {
              type: "text",

              text:
                `Failed to get my offers: ${
                  error instanceof Error
                    ? error.message
                    : "Unknown error"
                }`,
            },
          ],

          isError: true,
        };
      }
    },
  );



}

