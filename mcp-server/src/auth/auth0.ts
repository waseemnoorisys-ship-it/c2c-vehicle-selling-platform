import "dotenv/config";

import { createRemoteJWKSet, jwtVerify } from "jose";

import type { OAuthTokenVerifier } from "@modelcontextprotocol/express";
import type { AuthInfo } from "@modelcontextprotocol/server";
import { OAuthError, OAuthErrorCode } from "@modelcontextprotocol/server";

const issuer = process.env.AUTH0_ISSUER;
const audience = process.env.AUTH0_AUDIENCE;

if (!issuer) {
  throw new Error("Missing AUTH0_ISSUER");
}

if (!audience) {
  throw new Error("Missing AUTH0_AUDIENCE");
}

// Make sure issuer always ends with "/"
const normalizedIssuer = issuer.endsWith("/") ? issuer : `${issuer}/`;

const JWKS = createRemoteJWKSet(
  new URL(".well-known/jwks.json", normalizedIssuer)
);

export const auth0Verifier: OAuthTokenVerifier = {
  async verifyAccessToken(token: string): Promise<AuthInfo> {
    try {
      const { payload } = await jwtVerify(token, JWKS, {
        issuer: normalizedIssuer,
        audience,
        algorithms: ["RS256"],
      });

      const scopes =
        typeof payload.scope === "string"
          ? payload.scope.split(" ").filter(Boolean)
          : [];

      return {
        token,
        clientId:
          typeof payload.azp === "string"
            ? payload.azp
            : typeof payload.sub === "string"
              ? payload.sub
              : "unknown",
        scopes,
        expiresAt: payload.exp,
      };
    } catch (error) {
      console.error("Auth0 token verification failed:", error);

      throw new OAuthError(
        OAuthErrorCode.InvalidToken,
        "Invalid Auth0 access token"
      );
    }
  },
};