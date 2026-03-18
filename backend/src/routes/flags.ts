import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

export const flagsRouter = Router();

flagsRouter.use(requireAuth);

// ── GET /api/flags ────────────────────────────────────────────────────────────
// Fetch all feature flags — accessible by ALL authenticated roles
// Frontend uses this to show/hide features based on current toggle state
flagsRouter.get("/", async (_req, res: Response) => {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: [{ category: "asc" }, { label: "asc" }],
    });
    // Convert to key→value map for easy frontend consumption
    const flagMap: Record<string, boolean> = {};
    flags.forEach((f) => { flagMap[f.key] = f.isEnabled; });
    res.json({ flags, flagMap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch feature flags" });
  }
});

// ── PATCH /api/flags/:key ─────────────────────────────────────────────────────
// Toggle a feature flag — TECH_TEAM only
flagsRouter.patch("/:key", requireRole("TECH_TEAM"), async (req: AuthRequest, res: Response) => {
  const { isEnabled, updatedBy } = req.body as { isEnabled: boolean; updatedBy?: string };
  try {
    const flag = await prisma.featureFlag.update({
      where: { key: req.params.key },
      data: { isEnabled, updatedBy: updatedBy ?? "Tech Team" },
    });
    res.json(flag);
  } catch {
    res.status(404).json({ error: "Flag not found" });
  }
});

// ── POST /api/flags ───────────────────────────────────────────────────────────
// Add a new custom feature flag — TECH_TEAM only
flagsRouter.post("/", requireRole("TECH_TEAM"), async (req: AuthRequest, res: Response) => {
  const { key, label, description, category, isEnabled } = req.body as {
    key: string; label: string; description?: string;
    category?: string; isEnabled?: boolean;
  };
  if (!key || !label) {
    res.status(400).json({ error: "key and label are required" });
    return;
  }
  try {
    const flag = await prisma.featureFlag.create({
      data: { key: key.toUpperCase().replace(/\s+/g, "_"), label, description, category: category ?? "CUSTOM", isEnabled: isEnabled ?? true },
    });
    res.status(201).json(flag);
  } catch {
    res.status(409).json({ error: "Flag with this key already exists" });
  }
});

// ── DELETE /api/flags/:key ────────────────────────────────────────────────────
// Remove a custom flag — TECH_TEAM only (cannot delete system flags)
flagsRouter.delete("/:key", requireRole("TECH_TEAM"), async (req, res: Response) => {
  const systemKeys = ["MANAGER_ROLE", "REFER_EARN", "WITHDRAWALS", "PDF_DOWNLOADS", "LEADERBOARD", "WHATSAPP_NOTIFS", "SELF_REGISTRATION"];
  if (systemKeys.includes(req.params.key)) {
    res.status(403).json({ error: "Cannot delete system flags — only toggle them" });
    return;
  }
  try {
    await prisma.featureFlag.delete({ where: { key: req.params.key } });
    res.json({ message: "Flag deleted" });
  } catch {
    res.status(404).json({ error: "Flag not found" });
  }
});
