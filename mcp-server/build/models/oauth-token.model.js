import mongoose, { Schema } from "mongoose";
const OAuthTokenSchema = new Schema({
    accessToken: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    refreshToken: {
        type: String,
        default: null,
    },
    clientId: {
        type: String,
        required: true,
        index: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    userEmail: {
        type: String,
        default: null,
    },
    role: {
        type: String,
        enum: ["buyer", "vendor", "admin"],
        required: true,
    },
    scope: {
        type: String,
        default: "read write",
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }, // MongoDB TTL index
    },
}, {
    timestamps: true,
    collection: "oauth_tokens",
});
export const OAuthToken = mongoose.models.OAuthToken ||
    mongoose.model("OAuthToken", OAuthTokenSchema);
