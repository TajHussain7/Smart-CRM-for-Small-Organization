import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI as string,
  jwtSecret: process.env.JWT_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  nodeEnv: process.env.NODE_ENV || "development",
};

if (!env.mongoUri) {
  throw new Error("MONGO_URI is missing in .env");
}
if (!env.jwtSecret || !env.jwtRefreshSecret) {
  throw new Error("JWT secrets are missing in .env");
}