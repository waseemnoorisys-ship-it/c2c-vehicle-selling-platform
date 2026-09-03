import "dotenv/config";
import * as z from "zod/v4";
import { fetchC2CBackend } from "../auth/c2c-auth.service.js";
function getUserContext(extra) {
    const authInfo = extra?.http?.authInfo || extra?.authInfo;
    const userId = authInfo?.extra?.userId;
    const role = authInfo?.extra?.role;
    const email = authInfo?.extra?.userEmail;
    return {
        userId,
        role,
        email,
    };
}
function errorResponse(status, error) {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({
                    success: false,
                    status,
                    error,
                }, null, 2),
            },
        ],
        isError: true,
    };
}
function successResponse(data) {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(data, null, 2),
            },
        ],
    };
}
export function registerPaymentTools(server) {
    // ============================================================
    // Payment Tools
    // ============================================================
    // ------------------------------------------------------------
    // 1. Create Payment Checkout
    // Buyer only
    // ------------------------------------------------------------
    server.registerTool("payment_create", {
        title: "Create Vehicle Payment",
        description: "Create a secure Stripe Checkout payment for an accepted vehicle offer on behalf of the authenticated buyer. The C2C backend determines and validates the final payment amount.",
        inputSchema: z.object({
            offerId: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "offerId must be a valid 24-character hex MongoDB ObjectId")
                .describe("MongoDB ObjectId of the accepted offer"),
        }),
    }, async ({ offerId }, extra) => {
        const { userId, role } = getUserContext(extra);
        if (!userId) {
            return errorResponse(401, "Authentication required: No authenticated C2C user found.");
        }
        const result = await fetchC2CBackend("/api/v1/payments/create-intent", {
            method: "POST",
            body: {
                offerId,
            },
            userId,
            role,
            requiresAuth: true,
            allowedRoles: ["buyer"],
        });
        if (!result.success) {
            return errorResponse(result.status, result.error);
        }
        return successResponse(result.data);
    });
    // ------------------------------------------------------------
    // 2. Get Payment / Transaction Status
    // Buyer or Vendor
    // ------------------------------------------------------------
    server.registerTool("payment_status", {
        title: "Get Payment Status",
        description: "Get the payment and transaction details for a vehicle purchase. The authenticated buyer or vendor must belong to the transaction.",
        inputSchema: z.object({
            transactionId: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "transactionId must be a valid 24-character hex MongoDB ObjectId")
                .describe("MongoDB ObjectId of the transaction"),
        }),
    }, async ({ transactionId }, extra) => {
        const { userId, role } = getUserContext(extra);
        if (!userId) {
            return errorResponse(401, "Authentication required: No authenticated C2C user found.");
        }
        const result = await fetchC2CBackend("/api/v1/payments/transaction/get", {
            method: "POST",
            body: {
                transactionId,
            },
            userId,
            role,
            requiresAuth: true,
            allowedRoles: ["buyer", "vendor"],
        });
        if (!result.success) {
            return errorResponse(result.status, result.error);
        }
        return successResponse(result.data);
    });
    // ------------------------------------------------------------
    // 3. Confirm Delivery and Release Payment
    // Buyer only
    // ------------------------------------------------------------
    server.registerTool("payment_confirm_delivery", {
        title: "Confirm Vehicle Delivery",
        description: "Confirm that the buyer has received the vehicle. The C2C backend verifies the transaction and releases the escrowed vendor payment to the vendor wallet.",
        inputSchema: z.object({
            transactionId: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "transactionId must be a valid 24-character hex MongoDB ObjectId")
                .describe("MongoDB ObjectId of the escrowed transaction"),
        }),
    }, async ({ transactionId }, extra) => {
        const { userId, role } = getUserContext(extra);
        if (!userId) {
            return errorResponse(401, "Authentication required: No authenticated C2C user found.");
        }
        const result = await fetchC2CBackend("/api/v1/payments/confirm-delivery", {
            method: "POST",
            body: {
                transactionId,
            },
            userId,
            role,
            requiresAuth: true,
            allowedRoles: ["buyer"],
        });
        if (!result.success) {
            return errorResponse(result.status, result.error);
        }
        return successResponse(result.data);
    });
}
