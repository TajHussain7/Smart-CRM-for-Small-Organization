  import mongoose from "mongoose";
  import { env } from "../config/env";
  export const connectDB = async (): Promise<void> => {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection failed:", error);
      process.exit(1);
    }
  };