/**
 * OAuth Service - In-Memory Backend
 *
 * Stores:
 * - Authorization codes
 * - Dynamically registered OAuth clients
 *
 * Everything is in-memory for now.
 * Data will be lost when the server restarts.
 */

import { randomBytes } from "node:crypto";


// ============================================================
// OAuth Client
// ============================================================

export interface OAuthClient {
  clientId: string;
  clientName?: string;
  redirectUris: string[];
  grantTypes: string[];
  responseTypes: string[];
  tokenEndpointAuthMethod: string;
  scope?: string;
  createdAt: number;
}


// ============================================================
// Authorization Code
// ============================================================

export interface AuthorizationCode {
  code: string;
  clientId: string;
  redirectUri: string;
  userId: string;
  scope: string;
  codeChallenge: string;
  expiresAt: number;
}


// ============================================================
// In-memory storage
// ============================================================

const oauthClients = new Map<string, OAuthClient>();

const authorizationCodes =
  new Map<string, AuthorizationCode>();


// ============================================================
// Authorization code configuration
// ============================================================

const AUTHORIZATION_CODE_TTL = 60;


// ============================================================
// Dynamic Client Registration
// ============================================================

export function registerOAuthClient(params: {
  clientName?: string;
  redirectUris: string[];
  grantTypes?: string[];
  responseTypes?: string[];
  tokenEndpointAuthMethod?: string;
  scope?: string;
}): OAuthClient {

  const clientId =
    `c2c-client-${randomBytes(16).toString("hex")}`;

  const client: OAuthClient = {
    clientId,

    clientName:
      params.clientName,

    redirectUris:
      params.redirectUris,

    grantTypes:
      params.grantTypes ?? [
        "authorization_code",
      ],

    responseTypes:
      params.responseTypes ?? [
        "code",
      ],

    tokenEndpointAuthMethod:
      params.tokenEndpointAuthMethod ??
      "none",

    scope:
      params.scope,

    createdAt:
      Date.now(),
  };

  oauthClients.set(
    clientId,
    client,
  );

  console.log(
    "OAuth client registered:",
    clientId,
  );

  return client;
}


// ============================================================
// Get OAuth client
// ============================================================

export function getOAuthClient(
  clientId: string,
): OAuthClient | null {

  return (
    oauthClients.get(clientId) ??
    null
  );
}


// ============================================================
// Create authorization code
// ============================================================

export function createAuthorizationCode(params: {
  clientId: string;
  redirectUri: string;
  userId: string;
  scope: string;
  codeChallenge: string;
}): string {

  const code =
    randomBytes(32).toString("hex");

  const expiresAt =
    Date.now() +
    AUTHORIZATION_CODE_TTL * 1000;

  authorizationCodes.set(code, {
    code,

    clientId:
      params.clientId,

    redirectUri:
      params.redirectUri,

    userId:
      params.userId,

    scope:
      params.scope,

    codeChallenge:
      params.codeChallenge,

    expiresAt,
  });

  // Auto cleanup
  setTimeout(() => {
    authorizationCodes.delete(code);
  }, AUTHORIZATION_CODE_TTL * 1000);

  return code;
}


// ============================================================
// Consume authorization code
// ============================================================

export function consumeAuthorizationCode(
  code: string,
): AuthorizationCode | null {

  const authCode =
    authorizationCodes.get(code);

  if (!authCode) {
    return null;
  }

  // Expired
  if (
    authCode.expiresAt <
    Date.now()
  ) {
    authorizationCodes.delete(code);

    return null;
  }

  // Single-use
  authorizationCodes.delete(code);

  return authCode;
}