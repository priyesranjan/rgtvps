import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { SMSService } from "../lib/sms";
import { FeatureFlags } from "../lib/featureFlags";

export const investmentRouter = Router();

investmentRouter.use(requireAuth);

// ── POST /api/investments ─────────────────────────────────────────────────────
// Employee processes a new investment deposit (creates tranche + increments lead count)
investmentRouter.post("/", requireRole("EMPLOYEE", "MANAGER", "ADMIN"), async (req: AuthRequest, res: Response) => {
  const {
    investorId,
    principalAmount,
    interestRate,
    leadSource,
  } = req.body as {
    investorId: string;
    principalAmount: number;
    interestRate: number;
    leadSource?: string;
  };

  if (!investorId || !principalAmount || !interestRate) {
    res.status(400).json({ error: "investorId, principalAmount, and interestRate are required" });
    return;
  }

  const employeeId = req.user!.id;

  try {
    // Create the investment tranche + increment employee lead count atomically
    const [investment] = await prisma.$transaction([
      prisma.investment.create({
        data: {
          investorId,
          processedByEmployeeId: employeeId,
          principalAmount,
          interestRate,
          currentRate: interestRate,   // starts equal to original locked rate
          leadSource: leadSource ?? null,
        },
        include: {
          processedByEmployee: { select: { id: true, name: true, employeeCode: true } },
          investor: { select: { id: true, name: true, mobile: true } }
        }
      }),
      // Increment lead counters on processing employee
      prisma.employee.update({
        where: { id: employeeId },
        data: {
          totalLeadsCount: { increment: 1 },
          monthlyLeadCount: { increment: 1 },
        }
      })
    ]);

    // Send SMS Alert to Investor if enabled
    if (investment.investor.mobile && await FeatureFlags.isEnabled("SMS_ALERTS")) {
      SMSService.sendAlert(
        investment.investor.mobile,
        "RGT_DEPOSIT",
        [investment.investor.name, principalAmount.toString()]
      ).catch(err => console.error("Post-deposit SMS background error:", err));
    }

    res.status(201).json(investment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create investment" });
  }
});

// ── PATCH /api/investments/:investmentId/rate ─────────────────────────────────
// Manager or Admin changes the interest rate — creates full audit log entry
investmentRouter.patch(
  "/:investmentId/rate",
  requireRole("MANAGER", "ADMIN"),
  async (req: AuthRequest, res: Response) => {
    const { newRate, reason } = req.body as { newRate: number; reason?: string };
    if (!newRate) { res.status(400).json({ error: "newRate is required" }); return; }

    try {
      const investment = await prisma.investment.findUnique({
        where: { id: req.params.investmentId }
      });
      if (!investment) { res.status(404).json({ error: "Investment not found" }); return; }

      // Create audit log + update currentRate atomically
      const [log, updated] = await prisma.$transaction([
        prisma.rateChangeLog.create({
          data: {
            investmentId: investment.id,
            oldRate: investment.currentRate,
            newRate,
            reason: reason ?? null,
            changedByEmployeeId: req.user!.id,
            changedByRole: req.user!.role as "MANAGER" | "ADMIN",
          },
          include: {
            changedByEmployee: { select: { name: true, employeeCode: true } }
          }
        }),
        prisma.investment.update({
          where: { id: investment.id },
          data: { currentRate: newRate }
        })
      ]);

      res.json({ message: "Rate updated successfully", log, updatedInvestment: updated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update rate" });
    }
  }
);
