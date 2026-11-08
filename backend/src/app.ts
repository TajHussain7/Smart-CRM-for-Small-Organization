import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler, notFound } from "./common/middleware/error.middleware";
import { env } from "./config/env";

const app = express();

// Trust the first proxy hop (required on Render / behind a load balancer)
// so that rate-limiting reads the real client IP from X-Forwarded-For
app.set("trust proxy", 1);

// ─── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ─────────────────────────────────────────────────────────────────────
// CORS_ORIGIN can be a single origin or a comma-separated list of origins.
// e.g. "http://localhost:5173,https://your-app.vercel.app"
const allowedOrigins = env.corsOrigin
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' is not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Logging & body parsing ───────────────────────────────────────────────────
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json());

// ─── Root health check (required by Render's uptime monitoring) ───────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// ─── API routes ───────────────────────────────────────────────────────────────
app.use("/api/v1", routes);

// ─── Error handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;