import crypto from "node:crypto";
import { OAuthError, OAuthErrorCode } from "@modelcontextprotocol/server";
import { OAuthToken } from "../models/oauth-token.model.js";
/**
 * Verify PKCE code_verifier against code_challenge using S256 method.
 */
export function verifyPkce(codeVerifier, expectedCodeChallenge) {
    if (!codeVerifier || !expectedCodeChallenge) {
        return false;
    }
    const hash = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");
    return hash === expectedCodeChallenge;
}
/**
 * Create and persist an MCP Access Token in MongoDB.
 */
export async function createAccessToken(params) {
    const expiresIn = params.expiresIn ?? 3600;
    const accessToken = `mcp_at_${crypto.randomBytes(32).toString("hex")}`;
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    await OAuthToken.create({
        accessToken,
        clientId: params.clientId,
        userId: params.userId,
        userEmail: params.userEmail,
        role: params.role,
        scope: params.scope || "read write",
        expiresAt,
    });
    return {
        accessToken,
        expiresIn,
    };
}
/**
 * Validate an access token directly from MongoDB.
 */
export async function validateAccessToken(accessToken) {
    const tokenDoc = await OAuthToken.findOne({
        accessToken,
        expiresAt: { $gt: new Date() },
    });
    return tokenDoc;
}
/**
 * Production-ready OAuthTokenVerifier for MCP SDK v2.
 * Validates Bearer token against MongoDB and injects the authentic C2C user identity
 * into MCP request context (extra.userId, extra.role).
 */
export const tokenVerifier = {
    async verifyAccessToken(token) {
        try {
            const tokenDoc = await OAuthToken.findOne({
                accessToken: token,
            });
            if (!tokenDoc) {
                throw new OAuthError(OAuthErrorCode.InvalidToken, "Access token is invalid or does not exist.");
            }
            if (tokenDoc.expiresAt.getTime() < Date.now()) {
                await OAuthToken.deleteOne({ _id: tokenDoc._id });
                throw new OAuthError(OAuthErrorCode.InvalidToken, "Access token has expired.");
            }
            const scopes = tokenDoc.scope
                ? tokenDoc.scope.split(" ").filter(Boolean)
                : ["read", "write"];
            return {
                token,
                clientId: tokenDoc.clientId,
                scopes,
                expiresAt: Math.floor(tokenDoc.expiresAt.getTime() / 1000),
                extra: {
                    userId: tokenDoc.userId.toString(),
                    role: tokenDoc.role,
                    userEmail: tokenDoc.userEmail,
                },
            };
        }
        catch (error) {
            if (error instanceof OAuthError) {
                throw error;
            }
            throw new OAuthError(OAuthErrorCode.InvalidToken, "Failed to verify access token.");
        }
    },
};
