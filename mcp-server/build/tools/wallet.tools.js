import "dotenv/config";
import * as z from "zod/v4";
import { fetchC2CBackend } from "../auth/c2c-auth.service.js";
function getUserContext(extra) {
    const authInfo = extra?.http?.authInfo || extra?.authInfo;
    const userId = authInfo?.extra?.userId;
    const role = authInfo?.extra?.role;
    const email = authInfo?.extra?.userEmail;
    return { userId, role, email };
}
function errorResponse(status, error) {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify({ success: false, status, error }, null, 2),
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
export function registerWalletTools(server) {
    // ============================================================
    // Wallet Tools
    // ============================================================
    // ------------------------------------------------------------
    // 1. Create Withdrawal Request
    // Vendor only — must have bank details saved first
    // ------------------------------------------------------------
    server.registerTool("wallet_withdrawal_create", {
        title: "Request Wallet Withdrawal",
        description: "Submit a withdrawal request from the authenticated vendor's EUR wallet to their registered bank account. " +
            "The vendor must have bank details saved before using this tool. " +
            "Amount is in EUR cents (e.g. 5000 = €50.00, minimum 100 = €1.00). " +
            "The wallet is debited immediately and the withdrawal is placed in 'pending' status for admin approval. " +
            "Always confirm the amount with the vendor before proceeding.",
        inputSchema: z.object({
            amount: z
                .number()
                .int()
                .min(100)
                .describe("Withdrawal amount in EUR cents (integer). Minimum 100 (= €1.00). Example: 5000 = €50.00"),
        }),
    }, async ({ amount }, extra) => {
        const { userId, role } = getUserContext(extra);
        if (!userId) {
            return errorResponse(401, "Authentication required: No authenticated C2C user found.");
        }
        const result = await fetchC2CBackend("/api/v1/wallet/withdrawals/create", {
            method: "POST",
            body: { amount },
            userId,
            role,
            requiresAuth: true,
            allowedRoles: ["vendor"],
        });
        if (!result.success) {
            return errorResponse(result.status, result.error);
        }
        return successResponse(result.data);
    });
    // ------------------------------------------------------------
    // 2. List My Withdrawals (paginated)
    // Vendor only
    // ------------------------------------------------------------
    server.registerTool("wallet_withdrawal_list", {
        title: "List My Withdrawal Requests",
        description: "Retrieve a paginated list of the authenticated vendor's own withdrawal requests, ordered by most recent first. " +
            "Returns withdrawal status (pending / approved / rejected), amount in EUR cents, and timestamps.",
        inputSchema: z.object({
            page: z
                .number()
                .int()
                .min(1)
                .default(1)
                .optional()
                .describe("Page number (default: 1)"),
            limit: z
                .number()
                .int()
                .min(1)
                .max(100)
                .default(10)
                .optional()
                .describe("Number of withdrawals per page (default: 10, max: 100)"),
        }),
    }, async ({ page = 1, limit = 10 }, extra) => {
        const { userId, role } = getUserContext(extra);
        if (!userId) {
            return errorResponse(401, "Authentication required: No authenticated C2C user found.");
        }
        const result = await fetchC2CBackend("/api/v1/wallet/withdrawals/mine", {
            method: "POST",
            body: { page, limit },
            userId,
            role,
            requiresAuth: true,
            allowedRoles: ["vendor"],
        });
        if (!result.success) {
            return errorResponse(result.status, result.error);
        }
        return successResponse(result.data);
    });
    // ------------------------------------------------------------
    // 3. Get Single Withdrawal by ID
    // Vendor only (must be the owner)
    // ------------------------------------------------------------
    server.registerTool("wallet_withdrawal_get", {
        title: "Get Withdrawal Details",
        description: "Retrieve full details of a specific withdrawal request by its ID. " +
            "The authenticated vendor must be the owner of the withdrawal. " +
            "Returns status, amount in EUR cents, currency, bank details reference, and timestamps.",
        inputSchema: z.object({
            withdrawalId: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "withdrawalId must be a valid 24-character hex MongoDB ObjectId")
                .describe("MongoDB ObjectId of the withdrawal request"),
        }),
    }, async ({ withdrawalId }, extra) => {
        const { userId, role } = getUserContext(extra);
        if (!userId) {
            return errorResponse(401, "Authentication required: No authenticated C2C user found.");
        }
        const result = await fetchC2CBackend("/api/v1/wallet/withdrawals/get", {
            method: "POST",
            body: { withdrawalId },
            userId,
            role,
            requiresAuth: true,
            allowedRoles: ["vendor"],
        });
        if (!result.success) {
            return errorResponse(result.status, result.error);
        }
        return successResponse(result.data);
    });
    // ------------------------------------------------------------
    // 4. Get Invoice for a Transaction
    // Buyer or Vendor — must be a party to the transaction
    // ------------------------------------------------------------
    server.registerTool("wallet_invoice_get", {
        title: "Get Transaction Invoice",
        description: "Retrieve or auto-generate the invoice for a completed vehicle purchase transaction. " +
            "The authenticated user must be either the buyer or the vendor in the transaction. " +
            "Returns the full invoice document including buyer/vendor details, vehicle info, " +
            "amounts in EUR, platform commission, and invoice timestamps.",
        inputSchema: z.object({
            transactionId: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "transactionId must be a valid 24-character hex MongoDB ObjectId")
                .describe("MongoDB ObjectId of the payment transaction"),
        }),
    }, async ({ transactionId }, extra) => {
        const { userId, role } = getUserContext(extra);
        if (!userId) {
            return errorResponse(401, "Authentication required: No authenticated C2C user found.");
        }
        const result = await fetchC2CBackend("/api/v1/wallet/invoices/get", {
            method: "POST",
            body: { transactionId },
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
}
