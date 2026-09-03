import mongoose, { Schema } from "mongoose";
const OAuthSessionSchema = new Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    clientId: {
        type: String,
        required: true,
        index: true,
    },
    redirectUri: {
        type: String,
        required: true,
    },
    scope: {
        type: String,
        default: "read write",
    },
    state: {
        type: String,
        default: "",
    },
    codeChallenge: {
        type: String,
        required: true,
    },
    codeChallengeMethod: {
        type: String,
        required: true,
        enum: ["S256"],
        default: "S256",
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    userEmail: {
        type: String,
        default: null,
    },
    userRole: {
        type: String,
        enum: ["buyer", "vendor", "admin", null],
        default: null,
    },
    status: {
        type: String,
        enum: ["pending", "authenticated", "consumed", "expired"],
        default: "pending",
        index: true,
    },
    authorizationCode: {
        type: String,
        default: null,
        index: true,
    },
    codeExpiresAt: {
        type: Date,
        default: null,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // MongoDB TTL index to automatically purge expired sessions
    },
}, {
    timestamps: true,
    collection: "oauth_sessions",
});
export const OAuthSession = mongoose.models.OAuthSession ||
    mongoose.model("OAuthSession", OAuthSessionSchema);
