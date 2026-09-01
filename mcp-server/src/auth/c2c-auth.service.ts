import "dotenv/config";
import { SignJWT, jwtVerify } from "jose";

const C2C_API_BASE_URL =
  process.env.C2C_API_BASE_URL ||
  "https://c2c-vehicle-selling-platform.onrender.com";

/**
 * Generate a short-lived C2C backend access token signed with JWT_ACCESS_SECRET
 * for the authenticated user identity (userId and role).
 */
export async function generateC2CUserToken(
  userId: string,
  role: string,
): Promise<string> {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured in the MCP server environment.",
    );
  }

  const secretKey = new TextEncoder().encode(secret);

  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRES || "15m")
    .sign(secretKey);
}

/**
 * Verify a C2C JWT token received from frontend login using JWT_ACCESS_SECRET.
 */
export async function verifyC2CUserToken(
  token: string,
): Promise<{ userId: string; role: "buyer" | "vendor" | "admin" }> {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_ACCESS_SECRET is not configured in the MCP server environment.",
    );
  }

  const secretKey = new TextEncoder().encode(secret);

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.userId) {
      throw new Error("Token does not contain a valid userId.");
    }

    return {
      userId: String(payload.userId),
      role: (payload.role as "buyer" | "vendor" | "admin") || "buyer",
    };
  } catch (error) {
    throw new Error(
      `C2C token verification failed: ${error instanceof Error ? error.message : "Invalid token"
      }`,
    );
  }
}

export interface C2CBackendFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: Record<string, unknown>;
  userId?: string;
  role?: string;
  requiresAuth?: boolean;
  allowedRoles?: ("buyer" | "vendor" | "admin")[];
}

export interface C2CBackendFetchResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string | Record<string, unknown>;
}

/**
 * Execute an authenticated or public request against the C2C Backend REST API.
 * Automatically injects user-scoped JWT authorization and private MCP_INTERNAL_SECRET.
 */
export async function fetchC2CBackend(
  endpoint: string,
  options: C2CBackendFetchOptions = {},
): Promise<C2CBackendFetchResult> {
  const {
    method = "POST",
    body,
    userId,
    role = "buyer",
    requiresAuth = false,
    allowedRoles,
  } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Securely inject private MCP_INTERNAL_SECRET for backend verification
  if (process.env.MCP_INTERNAL_SECRET) {
    headers["x-mcp-internal-secret"] = process.env.MCP_INTERNAL_SECRET;
  }

  // Enforce authentication & role checks
  if (requiresAuth) {
    if (!userId) {
      return {
        success: false,
        status: 401,
        error:
          "Authentication required: No authenticated C2C user found in MCP request context.",
      };
    }

    if (
      allowedRoles &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(role as any)
    ) {
      return {
        success: false,
        status: 403,
        error: `Permission denied: This action requires one of the following roles: [${allowedRoles.join(
          ", ",
        )}]. Current user role is '${role}'.`,
      };
    }

    try {
      const userToken = await generateC2CUserToken(userId, role);
      headers["Authorization"] = `Bearer ${userToken}`;
    } catch (err) {
      return {
        success: false,
        status: 500,
        error: `Failed to sign C2C user token: ${err instanceof Error ? err.message : "Unknown error"
          }`,
      };
    }
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${C2C_API_BASE_URL}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data || `HTTP ${response.status}`,
      };
    }

    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      success: false,
      status: 500,
      error: `C2C API request failed: ${error instanceof Error ? error.message : "Network error"
        }`,
    };
  }
}
