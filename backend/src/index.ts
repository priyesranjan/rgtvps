import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { authRouter } from "./routes/auth";
import { goldAdvanceRouter } from "./routes/gold_advances";
import { withdrawalRouter } from "./routes/withdrawals";
import { staffRouter } from "./routes/staff";
import { adminRouter } from "./routes/admin";
import { usersRouter } from "./routes/users";
import { walletRouter } from "./routes/wallet";
import { returnRouter } from "./routes/returns";
import { referralRouter } from "./routes/referrals";
import { auditRouter } from "./routes/audit";
import { uploadRouter } from "./routes/upload";
import { adminCronRouter } from "./routes/adminCron";
import orderRouter from "./routes/OrderRoutes";
import productRouter from "./routes/ProductRoutes";
import { requireAuth, requireRole } from "./middleware/auth";
import { Role } from "@prisma/client";
import { startDailyReturnCron } from "./cron/dailyProfitCron";
import { SystemSettingController } from "./controllers/SystemSettingController";
import { FeatureFlagController } from "./controllers/FeatureFlagController";
import { validateEnvironment } from "./config/env";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
validateEnvironment();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3000"
  ],
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/gold-advances", goldAdvanceRouter);
app.use("/api/withdrawals", withdrawalRouter);
app.use("/api/staff", staffRouter);
app.use("/api/admin", adminRouter);
app.use("/api/users", usersRouter);
app.use("/api/wallet", walletRouter);
app.use("/api/daily-returns", returnRouter);
app.use("/api/referrals", referralRouter);
app.use("/api/audit", auditRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/admin/cron", adminCronRouter);
app.use("/api/orders", orderRouter);
app.use("/api/products", productRouter);

// Serve static files from storage directory
app.use("/uploads", express.static(path.join(process.cwd(), "storage", "uploads")));

// ── Settings ──────────────────────────────────────────────────────────────────
app.get("/api/settings", SystemSettingController.getSettings);
app.put("/api/settings", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), SystemSettingController.updateSettings);

// ── Feature Flags ─────────────────────────────────────────────────────────────
app.get("/api/feature-flags", requireAuth, FeatureFlagController.getFlags);
app.put("/api/feature-flags/:key", requireAuth, requireRole(Role.SUPERADMIN), FeatureFlagController.updateFlag);
app.delete("/api/feature-flags/:key", requireAuth, requireRole(Role.SUPERADMIN), FeatureFlagController.deleteFlag);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Return JSON for unknown API routes instead of Express HTML pages.
app.use("/api", (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "API route not found",
  });
});

// Global error handler to keep API responses JSON-only.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = typeof err === "object" && err !== null && "status" in err
    ? Number((err as { status?: number }).status) || 500
    : 500;

  const message = err instanceof Error ? err.message : "Internal server error";

  if (status >= 500) {
    console.error("[API ERROR]", err);
  }

  res.status(status).json({
    success: false,
    error: message,
  });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 RGT API running on http://0.0.0.0:${PORT}`);
  startDailyReturnCron();
});

export default app;
