import crypto from "node:crypto";

export interface AccessToken {
  userId: string;
  scope: string;
  expiresAt: number;
}

// In-memory access-token storage
// Tokens are lost when the MCP server restarts.
const accessTokens = new Map<string, AccessToken>();

/**
 * Verify PKCE code_verifier against code_challenge.
 */
export function verifyPkce(
  codeVerifier: string,
  expectedCodeChallenge: string,
): boolean {
  const hash = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  return hash === expectedCodeChallenge;
}

/**
 * Create and store an access token.
 */
export function createAccessToken(params: {
  userId: string;
  scope: string;
  expiresIn?: number;
}): {
  accessToken: string;
  expiresIn: number;
} {
  const expiresIn = params.expiresIn ?? 3600;

  const accessToken = crypto.randomBytes(32).toString("hex");

  accessTokens.set(accessToken, {
    userId: params.userId,
    scope: params.scope,
    expiresAt: Date.now() + expiresIn * 1000,
  });

  // Auto-cleanup after expiration
  setTimeout(() => {
    accessTokens.delete(accessToken);
  }, expiresIn * 1000);

  return {
    accessToken,
    expiresIn,
  };
}

/**
 * Validate an access token.
 */
export function validateAccessToken(
  accessToken: string,
): AccessToken | null {
  const tokenData = accessTokens.get(accessToken);

  if (!tokenData) {
    return null;
  }

  // Check expiration
  if (tokenData.expiresAt < Date.now()) {
    accessTokens.delete(accessToken);
    return null;
  }

  return tokenData;
}