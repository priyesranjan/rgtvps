import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { authRouter } from "./routes/auth";
import { investmentRouter } from "./routes/investments";
import { leaderboardRouter } from "./routes/leaderboard";
import { usersRouter } from "./routes/users";
import { flagsRouter } from "./routes/flags";
import { referralsRouter } from "./routes/referrals";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/investments", investmentRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/users", usersRouter);
app.use("/api/flags", flagsRouter);
app.use("/api/referrals", referralsRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 RGT API running on http://localhost:${PORT}`);
});

export default app;
