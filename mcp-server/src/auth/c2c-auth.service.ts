import "dotenv/config";

const C2C_API_BASE_URL =
  "https://c2c-vehicle-selling-platform.onrender.com";

let cachedAccessToken: string | null = null;


// ============================================================
// Get C2C access token
// ============================================================
//
// 1. Return cached access token if available.
// 2. Otherwise use the refresh token.
// 3. Ask C2C backend for a new access token.
// 4. Cache the new access token.
// ============================================================

export async function getC2CAccessToken(): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  const refreshToken =
    process.env.C2C_REFRESH_TOKEN;

  if (!refreshToken) {
    throw new Error(
      "C2C_REFRESH_TOKEN is not configured in the MCP server environment.",
    );
  }

  const response = await fetch(
    `${C2C_API_BASE_URL}/api/v1/auth/refresh-token`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        refreshToken,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `C2C token refresh failed: ${JSON.stringify(data)}`,
    );
  }

  const accessToken =
    data?.data?.accessToken;

  if (!accessToken) {
    throw new Error(
      "C2C refresh response did not contain an accessToken.",
    );
  }

  cachedAccessToken =
    accessToken;

  return accessToken;
}


// ============================================================
// Clear cached access token
// ============================================================
//
// Called when the C2C backend tells us that the cached token
// is expired/invalid.
// ============================================================

export function clearC2CAccessToken(): void {
  cachedAccessToken = null;
}


// ============================================================
// Execute authenticated C2C request
// ============================================================
//
// Automatically:
// - Gets access token
// - Sends request
// - If 401 occurs, clears token
// - Refreshes token
// - Retries once
// ============================================================

export async function c2cAuthenticatedFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  let accessToken =
    await getC2CAccessToken();

  const makeRequest = (
    token: string,
  ) => {
    const headers =
      new Headers(
        options.headers,
      );

    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );

    headers.set(
      "Content-Type",
      "application/json",
    );

    return fetch(
      url,
      {
        ...options,
        headers,
      },
    );
  };

  let response =
    await makeRequest(
      accessToken,
    );

  // ----------------------------------------------------------
  // Access token expired/invalid
  // ----------------------------------------------------------

  if (response.status === 401) {
    clearC2CAccessToken();

    accessToken =
      await getC2CAccessToken();

    response =
      await makeRequest(
        accessToken,
      );
  }

  return response;
}

