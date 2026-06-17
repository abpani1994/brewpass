import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import prisma from "./config/db.js";
import authRoutes from "./routes/auth.js";
import menuRoutes from "./routes/menu.js";
import customerRoutes from "./routes/customers.js";
import orderRoutes from "./routes/orders.js";
import dashboardRoutes from "./routes/dashboard.js";
import rewardRoutes from "./routes/rewards.js";
import smsRoutes from "./routes/sms.js";
import publicRoutes from "./routes/public.js";
import paymentRoutes from "./routes/payments.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Signing secret boot check.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be set and at least 32 characters");
}

const app = express();
app.set("trust proxy", 1); // behind a reverse proxy (Docker/cloud) — required for express-rate-limit + correct req.ip
app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));

// Stripe webhook needs the raw body — mount before json parsing.
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "1mb" }));

// Rate limits.
app.use("/api/auth", rateLimit({ windowMs: 60_000, max: 10 }));
app.use("/api", rateLimit({ windowMs: 60_000, max: 300 }));

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "ok" });
  } catch {
    res.status(503).json({ status: "down", db: "fail" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/sms", smsRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/payments", paymentRoutes);

// SPA static serving.
const distPath = path.join(__dirname, "../frontend/dist");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(distPath, "index.html"));
});

// Error sanitization.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, "0.0.0.0", () => {
  // Startup notice via stderr (console.error is intentional/allowed in production).
  process.stdout.write(`BrewPass API listening on ${PORT}\n`);
});

process.on("SIGTERM", () => server.close(() => prisma.$disconnect()));
process.on("SIGINT", () => server.close(() => prisma.$disconnect()));