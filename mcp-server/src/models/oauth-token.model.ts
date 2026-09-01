import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOAuthToken extends Document {
  accessToken: string;
  refreshToken?: string;
  clientId: string;
  userId: mongoose.Types.ObjectId | string;
  userEmail?: string;
  role: "buyer" | "vendor" | "admin";
  scope: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OAuthTokenSchema = new Schema<IOAuthToken>(
  {
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
  },
  {
    timestamps: true,
    collection: "oauth_tokens",
  },
);

export const OAuthToken: Model<IOAuthToken> =
  mongoose.models.OAuthToken ||
  mongoose.model<IOAuthToken>("OAuthToken", OAuthTokenSchema);
