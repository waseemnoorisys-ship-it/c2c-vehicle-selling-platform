import mongoose, { Schema, Document, Model } from "mongoose";

export type OAuthSessionStatus = "pending" | "authenticated" | "consumed" | "expired";

export interface IOAuthSession extends Document {
  sessionId: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
  codeChallenge: string;
  codeChallengeMethod: "S256";
  userId?: mongoose.Types.ObjectId | string;
  userEmail?: string;
  userRole?: "buyer" | "vendor" | "admin";
  status: OAuthSessionStatus;
  authorizationCode?: string;
  codeExpiresAt?: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OAuthSessionSchema = new Schema<IOAuthSession>(
  {
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
  },
  {
    timestamps: true,
    collection: "oauth_sessions",
  },
);

export const OAuthSession: Model<IOAuthSession> =
  mongoose.models.OAuthSession ||
  mongoose.model<IOAuthSession>("OAuthSession", OAuthSessionSchema);
