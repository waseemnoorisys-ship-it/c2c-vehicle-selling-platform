import mongoose, { Schema } from "mongoose";
const OAuthClientSchema = new Schema({
    clientId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    clientSecret: {
        type: String,
        default: null,
    },
    clientName: {
        type: String,
        default: null,
    },
    redirectUris: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => Array.isArray(v) && v.length > 0,
            message: "redirectUris must contain at least one valid URI.",
        },
    },
    grantTypes: {
        type: [String],
        default: ["authorization_code"],
    },
    responseTypes: {
        type: [String],
        default: ["code"],
    },
    tokenEndpointAuthMethod: {
        type: String,
        default: "none",
    },
    scope: {
        type: String,
        default: "read write",
    },
}, {
    timestamps: true,
    collection: "oauth_clients",
});
export const OAuthClient = mongoose.models.OAuthClient ||
    mongoose.model("OAuthClient", OAuthClientSchema);
