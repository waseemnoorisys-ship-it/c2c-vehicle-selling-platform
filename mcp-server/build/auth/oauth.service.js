import { randomBytes } from "node:crypto";
import { OAuthClient } from "../models/oauth-client.model.js";
import { OAuthSession } from "../models/oauth-session.model.js";
const AUTHORIZATION_CODE_TTL_SECONDS = 60;
const SESSION_TTL_MINUTES = 15;
/**
 * Register a new OAuth Client dynamically (RFC 7591) and persist to MongoDB.
 */
export async function registerOAuthClient(params) {
    const clientId = `c2c-client-${randomBytes(16).toString("hex")}`;
    const client = await OAuthClient.create({
        clientId,
        clientName: params.clientName,
        redirectUris: params.redirectUris,
        grantTypes: params.grantTypes ?? ["authorization_code"],
        responseTypes: params.responseTypes ?? ["code"],
        tokenEndpointAuthMethod: params.tokenEndpointAuthMethod ?? "none",
        scope: params.scope ?? "read write",
    });
    return client;
}
/**
 * Retrieve a registered OAuth Client from MongoDB.
 */
export async function getOAuthClient(clientId) {
    return OAuthClient.findOne({ clientId });
}
/**
 * Create a new pending OAuth Session in MongoDB when a user arrives at /oauth/authorize.
 */
export async function createOAuthSession(params) {
    const sessionId = `mcp_sess_${randomBytes(24).toString("hex")}`;
    const expiresAt = new Date(Date.now() + SESSION_TTL_MINUTES * 60 * 1000);
    const session = await OAuthSession.create({
        sessionId,
        clientId: params.clientId,
        redirectUri: params.redirectUri,
        scope: params.scope || "read write",
        state: params.state || "",
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: params.codeChallengeMethod,
        status: "pending",
        expiresAt,
    });
    return session;
}
/**
 * Find an OAuth session by sessionId.
 */
export async function getOAuthSession(sessionId) {
    return OAuthSession.findOne({ sessionId });
}
/**
 * Associate authenticated C2C User with OAuth session and generate single-use authorization code.
 */
export async function authenticateOAuthSession(params) {
    const authorizationCode = `c2c_code_${randomBytes(32).toString("hex")}`;
    const codeExpiresAt = new Date(Date.now() + AUTHORIZATION_CODE_TTL_SECONDS * 1000);
    const session = await OAuthSession.findOneAndUpdate({
        sessionId: params.sessionId,
        status: "pending",
        expiresAt: { $gt: new Date() },
    }, {
        $set: {
            userId: params.userId,
            userEmail: params.userEmail || null,
            userRole: params.userRole,
            status: "authenticated",
            authorizationCode,
            codeExpiresAt,
        },
    }, { new: true });
    if (!session) {
        return null;
    }
    return { session, authorizationCode };
}
/**
 * Atomically validate and consume a single-use authorization code.
 * Returns null if the code is invalid, already consumed, or expired.
 */
export async function consumeAuthorizationCode(code) {
    const now = new Date();
    const session = await OAuthSession.findOneAndUpdate({
        authorizationCode: code,
        status: "authenticated",
        codeExpiresAt: { $gt: now },
    }, {
        $set: {
            status: "consumed",
            authorizationCode: null, // Wipe code immediately to enforce strict single-use
        },
    }, { new: true });
    return session;
}
