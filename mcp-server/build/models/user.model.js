import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    mobile: { type: String, required: true },
    countryCode: { type: String, default: "+33" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["buyer", "vendor"], required: true },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    profilePhoto: { type: String, default: null },
    language: { type: String, enum: ["en", "fr"], default: "en" },
    deletedAt: { type: Date, default: null },
}, { timestamps: true });
userSchema.methods.comparePassword = async function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
