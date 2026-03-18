import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const leaderboardRouter = Router();

leaderboardRouter.use(requireAuth);

// ── GET /api/leaderboard ──────────────────────────────────────────────────────
// Returns all employees ranked by totalLeadsCount (all roles can access)
leaderboardRouter.get("/", async (_req: AuthRequest, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { isActive: true, role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        employeeCode: true,
        totalLeadsCount: true,
        monthlyLeadCount: true,
        branch: { select: { name: true, city: true } },
      },
      orderBy: { totalLeadsCount: "desc" },
    });

    const ranked = employees.map((emp: typeof employees[0], index: number) => ({
      rank: index + 1,
      ...emp,
    }));

    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// ── GET /api/leaderboard/monthly ──────────────────────────────────────────────
// Returns employees ranked by this month's lead count
leaderboardRouter.get("/monthly", async (_req: AuthRequest, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { isActive: true, role: "EMPLOYEE" },
      select: {
        id: true,
        name: true,
        employeeCode: true,
        monthlyLeadCount: true,
        totalLeadsCount: true,
        branch: { select: { name: true } },
      },
      orderBy: { monthlyLeadCount: "desc" },
    });

    const ranked = employees.map((emp: typeof employees[0], i: number) => ({ rank: i + 1, ...emp }));
    res.json(ranked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch monthly leaderboard" });
  }
});
