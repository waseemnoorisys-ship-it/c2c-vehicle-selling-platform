import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOAuthClient extends Document {
  clientId: string;
  clientSecret?: string;
  clientName?: string;
  redirectUris: string[];
  grantTypes: string[];
  responseTypes: string[];
  tokenEndpointAuthMethod: string;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OAuthClientSchema = new Schema<IOAuthClient>(
  {
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
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
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
  },
  {
    timestamps: true,
    collection: "oauth_clients",
  },
);

export const OAuthClient: Model<IOAuthClient> =
  mongoose.models.OAuthClient ||
  mongoose.model<IOAuthClient>("OAuthClient", OAuthClientSchema);
