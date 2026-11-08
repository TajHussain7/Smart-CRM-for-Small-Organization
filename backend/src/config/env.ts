import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || "5000", 10),
  mongoUri: (process.env.MONGO_URI || process.env.MONGODB_URI) as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtRefreshSecret: (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET) as string,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  nodeEnv: process.env.NODE_ENV || "development",
  // CORS_ORIGIN can be a comma-separated list of allowed origins
  // e.g. "http://localhost:5173,https://your-app.vercel.app"
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  notificationProvider: process.env.NOTIFICATION_PROVIDER || "mock",
  whatsappApiUrl: process.env.WHATSAPP_API_URL,
  whatsappPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  whatsappApiToken: process.env.WHATSAPP_API_TOKEN,
  aiEnabled: process.env.AI_ENABLED === "true",
  geminiApiKey: process.env.GEMINI_API_KEY,
};

if (!env.mongoUri && process.env.NODE_ENV !== "test") {
  console.warn("⚠️  Warning: MONGO_URI / MONGODB_URI is not set in environment.");
}
if (!env.jwtSecret && process.env.NODE_ENV !== "test") {
  console.warn("⚠️  Warning: JWT_SECRET is not set in environment.");
}
