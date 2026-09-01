import mongoose from "mongoose";

let isConnected = false;

export async function connectDB(): Promise<typeof mongoose> {
  if (isConnected) {
    return mongoose;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in the environment variables.");
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    isConnected = true;
    console.error("Connected to MongoDB for MCP OAuth persistence.");
    return conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
