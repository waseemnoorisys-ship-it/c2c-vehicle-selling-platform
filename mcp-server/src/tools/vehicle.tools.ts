import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { fetchC2CBackend } from "../auth/c2c-auth.service.js";
import {
  fetchC2CBackendMultipart,
  downloadImageForMcp,
} from "../auth/c2c-multipart.service.js";

/**
 * Extract authenticated C2C user context from MCP request.
 */
function getUserContext(extra: any): {
  userId?: string;
  role?: "buyer" | "vendor" | "admin";
  email?: string;
} {
  const authInfo = extra?.http?.authInfo || extra?.authInfo;
  const userId = authInfo?.extra?.userId as string | undefined;
  const role = authInfo?.extra?.role as
    | "buyer"
    | "vendor"
    | "admin"
    | undefined;
  const email = authInfo?.extra?.userEmail as string | undefined;

  return { userId, role, email };
}

export function registerVehicleTools(server: McpServer) {
  // ============================================================
  // 1. Search Vehicles (Public Marketplace Search)
  // ============================================================
  server.registerTool(
    "search_vehicles",
    {
      title: "Search Vehicles",
      description:
        "Search approved vehicles available on the C2C vehicle marketplace with flexible filters.",
      inputSchema: z.object({
        search: z
          .string()
          .optional()
          .describe("Search keyword for vehicle title/make/model"),
        makeId: z
          .string()
          .optional()
          .describe("MongoDB ObjectId of the vehicle make"),
        modelId: z
          .string()
          .optional()
          .describe("MongoDB ObjectId of the vehicle model"),
        minYear: z.number().optional().describe("Minimum manufacturing year"),
        maxYear: z.number().optional().describe("Maximum manufacturing year"),
        minPrice: z
          .number()
          .optional()
          .describe("Minimum price in lowest currency unit"),
        maxPrice: z
          .number()
          .optional()
          .describe("Maximum price in lowest currency unit"),
        fuelType: z
          .string()
          .optional()
          .describe("Fuel type (e.g. petrol, diesel, electric, hybrid)"),
        transmission: z
          .string()
          .optional()
          .describe("Transmission (e.g. manual, automatic)"),
        condition: z
          .string()
          .optional()
          .describe("Vehicle condition (e.g. new, used)"),
        latitude: z
          .number()
          .optional()
          .describe("Latitude for proximity search"),
        longitude: z
          .number()
          .optional()
          .describe("Longitude for proximity search"),
        radius: z.number().optional().describe("Search radius in kilometers"),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        sort: z
          .enum(["newest", "oldest", "price_asc", "price_desc", "most_viewed"])
          .optional()
          .describe("Sorting order"),
        page: z.number().optional().describe("Page number (defaults to 1)"),
        limit: z
          .number()
          .optional()
          .describe("Items per page (defaults to 10)"),
      }),
    },
    async (filters, _extra) => {
      const result = await fetchC2CBackend("/api/v1/listings/browse", {
        method: "POST",
        body: filters,
        requiresAuth: false,
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 2. Get Vehicle Details (Public)
  // ============================================================
  server.registerTool(
    "get_vehicle_details",
    {
      title: "Get Vehicle Details",
      description:
        "Get complete specifications, images, and seller details of a vehicle listing using its listing ID.",
      inputSchema: z.object({
        listingId: z
          .string()
          .describe("The unique MongoDB ObjectId of the vehicle listing"),
      }),
    },
    async ({ listingId }, _extra) => {
      const result = await fetchC2CBackend("/api/v1/listings/get", {
        method: "POST",
        body: { id: listingId },
        requiresAuth: false,
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 3. Create Vehicle Offer (Buyer Role Required)
  // ============================================================
  server.registerTool(
    "offer_create",
    {
      title: "Create Vehicle Offer",
      description:
        "Submit a formal purchase offer for a vehicle listing on the C2C marketplace on behalf of the authenticated buyer.",
      inputSchema: z.object({
        listingId: z
          .string()
          .regex(
            /^[a-fA-F0-9]{24}$/,
            "listingId must be a valid 24-character hex MongoDB ObjectId",
          )
          .describe("The MongoDB ObjectId of the vehicle listing"),
        amount: z
          .number()
          .int()
          .min(1)
          .describe("Offer amount in backend's currency unit (cents/pennies)"),
        message: z
          .string()
          .trim()
          .max(500)
          .optional()
          .describe("Optional note to the vehicle seller"),
      }),
    },
    async ({ listingId, amount, message }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/offers/create", {
        method: "POST",
        body: {
          listingId,
          amount,
          ...(message ? { message } : {}),
        },
        userId,
        role,
        requiresAuth: true,
        allowedRoles: ["buyer"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 4. Get Offer Details (Buyer or Vendor)
  // ============================================================
  server.registerTool(
    "offer_get",
    {
      title: "Get Offer Details",
      description:
        "Get details and current status (pending, accepted, rejected) of a specific offer.",
      inputSchema: z.object({
        id: z
          .string()
          .regex(
            /^[a-fA-F0-9]{24}$/,
            "Offer id must be a valid 24-character hex MongoDB ObjectId",
          )
          .describe("The MongoDB ObjectId of the offer"),
      }),
    },
    async ({ id }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/offers/get", {
        method: "POST",
        body: { id },
        userId,
        role,
        requiresAuth: true,
        allowedRoles: ["buyer", "vendor", "admin"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 5. Get My Offers (Buyer Role Required)
  // ============================================================
  server.registerTool(
    "offer_mine",
    {
      title: "Get My Offers",
      description:
        "Get the authenticated buyer's submitted vehicle offers from the marketplace.",
      inputSchema: z.object({
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Page number (defaults to 1)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Number of offers to return (max 50)"),
      }),
    },
    async ({ page, limit }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/offers/mine", {
        method: "POST",
        body: {
          ...(page !== undefined ? { page } : {}),
          ...(limit !== undefined ? { limit } : {}),
        },
        userId,
        role,
        requiresAuth: true,
        allowedRoles: ["buyer"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 6. Get Received Offers (Vendor Role Required)
  // ============================================================
  server.registerTool(
    "offer_received",
    {
      title: "Get Received Offers",
      description:
        "Get offers received on the authenticated vendor's vehicle listings.",
      inputSchema: z.object({
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Page number (defaults to 1)"),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Items per page (max 50)"),
        status: z
          .enum(["pending", "accepted", "rejected", "expired"])
          .optional()
          .describe("Filter by offer status"),
      }),
    },
    async ({ page, limit, status }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/offers/received", {
        method: "POST",
        body: {
          ...(page !== undefined ? { page } : {}),
          ...(limit !== undefined ? { limit } : {}),
          ...(status ? { status } : {}),
        },
        userId,
        role,
        requiresAuth: true,
        allowedRoles: ["vendor"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 7. Accept Offer (Vendor Role Required)
  // ============================================================
  server.registerTool(
    "offer_accept",
    {
      title: "Accept Offer",
      description:
        "Accept a buyer's offer on the authenticated vendor's vehicle listing.",
      inputSchema: z.object({
        offerId: z
          .string()
          .regex(
            /^[a-fA-F0-9]{24}$/,
            "offerId must be a valid 24-character hex MongoDB ObjectId",
          )
          .describe("The MongoDB ObjectId of the offer to accept"),
      }),
    },
    async ({ offerId }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/offers/accept", {
        method: "POST",
        body: { id: offerId },
        userId,
        role,
        requiresAuth: true,
        allowedRoles: ["vendor"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 8. Reject Offer (Vendor Role Required)
  // ============================================================
  server.registerTool(
    "offer_reject",
    {
      title: "Reject Offer",
      description:
        "Reject a buyer's offer on the authenticated vendor's vehicle listing.",
      inputSchema: z.object({
        offerId: z
          .string()
          .regex(
            /^[a-fA-F0-9]{24}$/,
            "offerId must be a valid 24-character hex MongoDB ObjectId",
          )
          .describe("The MongoDB ObjectId of the offer to reject"),
        reason: z
          .string()
          .trim()
          .max(500)
          .optional()
          .describe("Optional rejection reason provided to the buyer"),
      }),
    },
    async ({ offerId, reason }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/offers/reject", {
        method: "POST",
        body: {
          id: offerId,
          ...(reason ? { reason } : {}),
        },
        userId,
        role,
        requiresAuth: true,
        allowedRoles: ["vendor"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 9. Expire offer (vendor role required)
  // ============================================================

  server.registerTool(
    "listing_mine",
    {
      title: "Get My Listings",

      description:
        "Get vehicle listings owned by the authenticated vendor. Optionally filter by listing status and pagination.",

      inputSchema: z.object({
        status: z
          .enum([
            "draft",
            "pending",
            "approved",
            "rejected",
            "sold",
            "inactive",
          ])
          .optional()
          .describe("Optional listing status filter"),

        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Page number, starting from 1"),

        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Number of listings per page, maximum 50"),
      }),
    },

    async ({ status, page, limit }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/listings/mine", {
        method: "POST",

        body: {
          ...(status !== undefined && { status }),
          ...(page !== undefined && { page }),
          ...(limit !== undefined && { limit }),
        },

        userId,
        role,

        requiresAuth: true,

        allowedRoles: ["vendor"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 10. create listing (vendor role required)
  // ============================================================
  server.registerTool(
    "listing_create",
    {
      title: "Create Vehicle Listing",

      description: "Create a new vehicle listing for the authenticated vendor.",

      inputSchema: z.object({
        makeId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("Vehicle make MongoDB ObjectId"),

        modelId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("Vehicle model MongoDB ObjectId"),

        year: z
          .number()
          .int()
          .min(1950)
          .max(new Date().getFullYear() + 1)
          .describe("Vehicle manufacturing year"),

        registrationNumber: z
          .string()
          .trim()
          .max(30)
          .optional()
          .describe("Vehicle registration number"),

        mileage: z.number().min(0).describe("Vehicle mileage"),

        fuelType: z
          .enum(["petrol", "diesel", "electric", "hybrid", "cng", "lpg"])
          .describe("Vehicle fuel type"),

        transmission: z
          .enum(["manual", "automatic", "semi-automatic"])
          .describe("Vehicle transmission type"),

        condition: z
          .enum(["new", "used", "certified-pre-owned"])
          .optional()
          .describe("Vehicle condition"),

        askingPrice: z
          .number()
          .int()
          .min(1)
          .describe("Vehicle asking price in INR"),

        locationText: z
          .string()
          .trim()
          .max(200)
          .optional()
          .describe("Vehicle location"),

        latitude: z
          .number()
          .min(-90)
          .max(90)
          .optional()
          .describe("Location latitude"),

        longitude: z
          .number()
          .min(-180)
          .max(180)
          .optional()
          .describe("Location longitude"),

        submitForApproval: z
          .boolean()
          .optional()
          .describe("Whether to submit the listing for approval immediately"),
      }),
    },

    async (
      {
        makeId,
        modelId,
        year,
        registrationNumber,
        mileage,
        fuelType,
        transmission,
        condition,
        askingPrice,
        locationText,
        latitude,
        longitude,
        submitForApproval,
      },
      extra,
    ) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/listings/create", {
        method: "POST",

        body: {
          makeId,
          modelId,
          year,
          ...(registrationNumber !== undefined && {
            registrationNumber,
          }),
          mileage,
          fuelType,
          transmission,
          ...(condition !== undefined && {
            condition,
          }),
          askingPrice,
          ...(locationText !== undefined && {
            locationText,
          }),
          ...(latitude !== undefined && {
            latitude,
          }),
          ...(longitude !== undefined && {
            longitude,
          }),
          ...(submitForApproval !== undefined && {
            submitForApproval,
          }),
        },

        userId,
        role,

        requiresAuth: true,

        allowedRoles: ["vendor"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 11. update listing (vendor role required)
  // ============================================================
  server.registerTool(
    "listing_update",
    {
      title: "Update Vehicle Listing",

      description:
        "Update an existing vehicle listing owned by the authenticated vendor.",

      inputSchema: z.object({
        id: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("Listing MongoDB ObjectId"),

        makeId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .optional()
          .describe("Vehicle make MongoDB ObjectId"),

        modelId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .optional()
          .describe("Vehicle model MongoDB ObjectId"),

        year: z
          .number()
          .int()
          .min(1950)
          .max(new Date().getFullYear() + 1)
          .optional()
          .describe("Vehicle manufacturing year"),

        registrationNumber: z
          .string()
          .trim()
          .max(30)
          .optional()
          .describe("Vehicle registration number"),

        mileage: z.number().min(0).optional().describe("Vehicle mileage"),

        fuelType: z
          .enum(["petrol", "diesel", "electric", "hybrid", "cng", "lpg"])
          .optional()
          .describe("Vehicle fuel type"),

        transmission: z
          .enum(["manual", "automatic", "semi-automatic"])
          .optional()
          .describe("Vehicle transmission type"),

        condition: z
          .enum(["new", "used", "certified-pre-owned"])
          .optional()
          .describe("Vehicle condition"),

        askingPrice: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Vehicle asking price in INR"),

        locationText: z
          .string()
          .trim()
          .max(200)
          .optional()
          .describe("Vehicle location"),

        latitude: z
          .number()
          .min(-90)
          .max(90)
          .optional()
          .describe("Location latitude"),

        longitude: z
          .number()
          .min(-180)
          .max(180)
          .optional()
          .describe("Location longitude"),
      }),
    },

    async (
      {
        id,
        makeId,
        modelId,
        year,
        registrationNumber,
        mileage,
        fuelType,
        transmission,
        condition,
        askingPrice,
        locationText,
        latitude,
        longitude,
      },
      extra,
    ) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/listings/update", {
        method: "POST",

        body: {
          id,
          ...(makeId !== undefined && { makeId }),
          ...(modelId !== undefined && { modelId }),
          ...(year !== undefined && { year }),
          ...(registrationNumber !== undefined && {
            registrationNumber,
          }),
          ...(mileage !== undefined && { mileage }),
          ...(fuelType !== undefined && { fuelType }),
          ...(transmission !== undefined && {
            transmission,
          }),
          ...(condition !== undefined && { condition }),
          ...(askingPrice !== undefined && {
            askingPrice,
          }),
          ...(locationText !== undefined && {
            locationText,
          }),
          ...(latitude !== undefined && { latitude }),
          ...(longitude !== undefined && { longitude }),
        },

        userId,
        role,

        requiresAuth: true,

        allowedRoles: ["vendor"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  // 12. delete listing (vendor role required)
  // ============================================================
  server.registerTool(
    "listing_delete",
    {
      title: "Delete Vehicle Listing",

      description:
        "Delete a vehicle listing owned by the authenticated vendor.",

      inputSchema: z.object({
        id: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("Listing MongoDB ObjectId"),
      }),
    },

    async ({ id }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend("/api/v1/listings/delete", {
        method: "POST",

        body: {
          id,
        },

        userId,
        role,

        requiresAuth: true,

        allowedRoles: ["vendor"],
      });

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // ============================================================
  //13. submit listing for approval (vendor role required)
  // ============================================================
  server.registerTool(
    "listing_submit",
    {
      title: "Submit Vehicle Listing",

      description:
        "Submit an existing vehicle listing for approval by the authenticated vendor.",

      inputSchema: z.object({
        id: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("Listing MongoDB ObjectId"),
      }),
    },

    async ({ id }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend(
        "/api/v1/listings/submit",
        {
          method: "POST",

          body: {
            id,
          },

          userId,
          role,

          requiresAuth: true,

          allowedRoles: ["vendor"],
        },
      );

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              result.data,
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // ============================================================
  //14. reject listing (vendor role required)
  // ============================================================
  server.registerTool(
    "listing_photos_delete",
    {
      title: "Delete Listing Photo",

      description:
        "Delete a photo from a vehicle listing owned by the authenticated vendor.",

      inputSchema: z.object({
        id: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("Listing MongoDB ObjectId"),

        publicId: z
          .string()
          .trim()
          .min(1)
          .describe("Cloudinary public ID of the photo to delete"),
      }),
    },

    async ({ id, publicId }, extra) => {
      const { userId, role } = getUserContext(extra);

      const result = await fetchC2CBackend(
        "/api/v1/listings/photos/delete",
        {
          method: "POST",

          body: {
            id,
            publicId,
          },

          userId,
          role,

          requiresAuth: true,

          allowedRoles: ["vendor"],
        },
      );

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              result.data,
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // ============================================================= 
  // 15. upload photo to a listing 
  // =============================================================

  server.registerTool(
    "listing_photos_add",
    {
      title: "Add Photos to Vehicle Listing",

      description:
        "Add one or more vehicle photos to a listing owned by the authenticated vendor. Provide publicly accessible HTTPS image URLs. Maximum 10 photos, 5 MB each. Supported formats: JPEG, PNG and WebP.",

      inputSchema: z.object({
        id: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("Listing MongoDB ObjectId"),

        photoUrls: z
          .array(
            z
              .string()
              .url()
              .refine(
                (value) => {
                  try {
                    const url = new URL(value);

                    return (
                      url.protocol === "http:" ||
                      url.protocol === "https:"
                    );
                  } catch {
                    return false;
                  }
                },
                {
                  message:
                    "Photo URL must use HTTP or HTTPS.",
                },
              ),
          )
          .min(1)
          .max(10)
          .describe(
            "Publicly accessible image URLs. Maximum 10 photos.",
          ),
      }),
    },

    async ({ id, photoUrls }, extra) => {
      const { userId, role } =
        getUserContext(extra);

      if (!userId) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: 401,
                  error:
                    "Authentication required: No authenticated C2C user found.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      if (role !== "vendor") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: 403,
                  error:
                    "Permission denied: listing photos can only be added by vendors.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        const files = [];

        for (
          let index = 0;
          index < photoUrls.length;
          index++
        ) {
          const photo = await downloadImageForMcp(
            photoUrls[index],
            index,
          );

          files.push({
            fieldName: "photos",
            filename: photo.filename,
            mimeType: photo.mimeType,
            data: photo.data,
          });
        }

        const result =
          await fetchC2CBackendMultipart(
            "/api/v1/listings/photos/add",
            {
              method: "POST",

              body: {
                id,
              },

              files,

              userId,
              role,

              requiresAuth: true,

              allowedRoles: ["vendor"],
            },
          );

        if (!result.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    status: result.status,
                    error: result.error,
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                result.data,
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
              text: JSON.stringify(
                {
                  success: false,
                  status: 400,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Failed to process listing photos.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ======================================================
  // 16. create listing +  photo
  // ======================================================
  server.registerTool(
    "listing_create_with_photos",
    {
      title: "Create Vehicle Listing with Photos",

      description:
        "Create a new vehicle listing with one or more photos for the authenticated vendor. Provide publicly accessible HTTP or HTTPS image URLs. Maximum 10 photos, 5 MB each. Supported formats: JPEG, PNG and WebP.",

      inputSchema: z.object({
        makeId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("MongoDB ObjectId of the vehicle make"),

        modelId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/)
          .describe("MongoDB ObjectId of the vehicle model"),

        year: z
          .number()
          .int()
          .min(1950)
          .describe("Vehicle manufacturing year"),

        registrationNumber: z
          .string()
          .max(30)
          .optional()
          .describe("Vehicle registration number"),

        mileage: z
          .number()
          .min(0)
          .describe("Vehicle mileage"),

        fuelType: z
          .enum([
            "petrol",
            "diesel",
            "electric",
            "hybrid",
            "cng",
            "lpg",
          ])
          .describe("Vehicle fuel type"),

        transmission: z
          .enum([
            "manual",
            "automatic",
            "semi-automatic",
          ])
          .describe("Vehicle transmission type"),

        condition: z
          .enum([
            "new",
            "used",
            "certified-pre-owned",
          ])
          .optional()
          .describe("Vehicle condition"),

        askingPrice: z
          .number()
          .int()
          .min(1)
          .describe("Vehicle asking price in INR"),

        locationText: z
          .string()
          .max(200)
          .optional()
          .describe("Vehicle location"),

        latitude: z
          .number()
          .min(-90)
          .max(90)
          .optional()
          .describe("Location latitude"),

        longitude: z
          .number()
          .min(-180)
          .max(180)
          .optional()
          .describe("Location longitude"),

        submitForApproval: z
          .boolean()
          .optional()
          .describe(
            "Whether to submit the listing for approval immediately",
          ),

        photoUrls: z
          .array(
            z
              .string()
              .url()
              .refine(
                (value) => {
                  try {
                    const url = new URL(value);

                    return (
                      url.protocol === "http:" ||
                      url.protocol === "https:"
                    );
                  } catch {
                    return false;
                  }
                },
                {
                  message:
                    "Photo URL must use HTTP or HTTPS.",
                },
              ),
          )
          .min(1)
          .max(10)
          .describe(
            "Publicly accessible image URLs. Minimum 1 and maximum 10 photos.",
          ),
      }),
    },

    async (
      {
        makeId,
        modelId,
        year,
        registrationNumber,
        mileage,
        fuelType,
        transmission,
        condition,
        askingPrice,
        locationText,
        latitude,
        longitude,
        submitForApproval,
        photoUrls,
      },
      extra,
    ) => {
      const { userId, role } = getUserContext(extra);

      if (!userId) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: 401,
                  error:
                    "Authentication required: No authenticated C2C user found.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      if (role !== "vendor") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: 403,
                  error:
                    "Permission denied: vehicle listings can only be created by vendors.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      try {
        const files = [];

        for (
          let index = 0;
          index < photoUrls.length;
          index++
        ) {
          const photo = await downloadImageForMcp(
            photoUrls[index],
            index,
          );

          files.push({
            fieldName: "photos",
            filename: photo.filename,
            mimeType: photo.mimeType,
            data: photo.data,
          });
        }

        const result =
          await fetchC2CBackendMultipart(
            "/api/v1/listings/create-with-photos",
            {
              method: "POST",

              body: {
                makeId,
                modelId,
                year,
                ...(registrationNumber !== undefined && {
                  registrationNumber,
                }),
                mileage,
                fuelType,
                transmission,
                ...(condition !== undefined && {
                  condition,
                }),
                askingPrice,
                ...(locationText !== undefined && {
                  locationText,
                }),
                ...(latitude !== undefined && {
                  latitude,
                }),
                ...(longitude !== undefined && {
                  longitude,
                }),
                ...(submitForApproval !== undefined && {
                  submitForApproval,
                }),
              },

              files,

              userId,
              role,

              requiresAuth: true,

              allowedRoles: ["vendor"],
            },
          );

        if (!result.success) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    success: false,
                    status: result.status,
                    error: result.error,
                  },
                  null,
                  2,
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                result.data,
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
              text: JSON.stringify(
                {
                  success: false,
                  status: 400,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Failed to create listing with photos.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }
    },
  );

  // ============================================================
  // Notification Tools
  // ============================================================

  // 1. Get My Notifications
  server.registerTool(
    "notification_list",
    {
      title: "Get My Notifications",
      description:
        "Get notifications for the currently authenticated C2C user. Supports pagination and filtering for unread notifications.",
      inputSchema: z.object({
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Page number. Defaults to 1."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Number of notifications to return. Maximum 50."),
        unread: z
          .boolean()
          .optional()
          .describe("If true, return only unread notifications."),
      }),
    },
    async ({ page, limit, unread }, extra) => {
      const { userId, role } = getUserContext(extra);

      if (!userId) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: 401,
                  error:
                    "Authentication required: No authenticated C2C user found.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      const result = await fetchC2CBackend(
        "/api/v1/notifications/mine",
        {
          method: "POST",
          body: {
            page: page ?? 1,
            limit: limit ?? 20,
            ...(unread !== undefined ? { unread } : {}),
          },
          userId,
          role,
          requiresAuth: true,
        },
      );

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // 2. Mark One Notification as Read
  server.registerTool(
    "notification_read",
    {
      title: "Mark Notification as Read",
      description:
        "Mark one notification as read for the currently authenticated C2C user.",
      inputSchema: z.object({
        id: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid notification ID.")
          .describe("MongoDB ObjectId of the notification."),
      }),
    },
    async ({ id }, extra) => {
      const { userId, role } = getUserContext(extra);

      if (!userId) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: 401,
                  error:
                    "Authentication required: No authenticated C2C user found.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      const result = await fetchC2CBackend(
        "/api/v1/notifications/read",
        {
          method: "POST",
          body: { id },
          userId,
          role,
          requiresAuth: true,
        },
      );

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

  // 3. Mark All Notifications as Read
  server.registerTool(
    "notification_read_all",
    {
      title: "Mark All Notifications as Read",
      description:
        "Mark all unread notifications belonging to the currently authenticated C2C user as read.",
      inputSchema: z.object({}),
    },
    async (_args, extra) => {
      const { userId, role } = getUserContext(extra);

      if (!userId) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: 401,
                  error:
                    "Authentication required: No authenticated C2C user found.",
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      const result = await fetchC2CBackend(
        "/api/v1/notifications/read-all",
        {
          method: "POST",
          body: {},
          userId,
          role,
          requiresAuth: true,
        },
      );

      if (!result.success) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  status: result.status,
                  error: result.error,
                },
                null,
                2,
              ),
            },
          ],
          isError: true,
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result.data, null, 2),
          },
        ],
      };
    },
  );

}
