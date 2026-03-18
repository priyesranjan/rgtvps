import { Router, Response } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";
import { SMSService } from "../lib/sms";
import { FeatureFlags } from "../lib/featureFlags";

export const referralsRouter = Router();

referralsRouter.use(requireAuth);

// ── GET /api/referrals/my ─────────────────────────────────────────────────────
// Investor views their referral earnings summary
referralsRouter.get("/my", async (req: AuthRequest, res: Response) => {
  if (req.user?.type !== "investor") {
    res.status(403).json({ error: "Only investors can view referral earnings" });
    return;
  }
  try {
    const investor = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { referralCode: true, referredByCode: true }
    });

    const referrals = await prisma.referral.findMany({
      where: { referrerId: req.user.id },
      include: {
        referredUser: { select: { name: true, mobile: true } },
        earnings: { orderBy: { createdAt: "desc" } }
      }
    });

    const totalEarned = referrals.flatMap(r => r.earnings).reduce((sum, e) => sum + Number(e.amount), 0);
    const pendingWithdrawal = referrals.flatMap(r => r.earnings).filter(e => !e.isWithdrawn).reduce((sum, e) => sum + Number(e.amount), 0);

    res.json({ referralCode: investor?.referralCode, referrals, totalEarned, pendingWithdrawal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch referrals" });
  }
});

// ── POST /api/referrals ───────────────────────────────────────────────────────
// Employee/Manager links a referral (sets the commission amount)
referralsRouter.post("/", requireRole("EMPLOYEE", "MANAGER", "ADMIN"), async (req: AuthRequest, res: Response) => {
  const { referrerId, referredUserId, commissionAmount, commissionNote } = req.body as {
    referrerId: string; referredUserId: string;
    commissionAmount: number; commissionNote?: string;
  };

  if (!referrerId || !referredUserId || !commissionAmount) {
    res.status(400).json({ error: "referrerId, referredUserId, commissionAmount are required" });
    return;
  }

  try {
    const existing = await prisma.referral.findUnique({ where: { referredUserId } });
    if (existing) {
      res.status(409).json({ error: "This investor is already linked to a referral" });
      return;
    }

    const referral = await prisma.referral.create({
      data: {
        referrerId,
        referredUserId,
        commissionAmount,
        commissionNote: commissionNote ?? null,
        setByEmployeeId: req.user!.id,
      },
      include: {
        referrer: { select: { name: true, referralCode: true } },
        referredUser: { select: { name: true } }
      }
    });
    res.status(201).json(referral);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create referral" });
  }
});

// ── POST /api/referrals/:id/earnings ─────────────────────────────────────────
// Manager/Admin credits a commission earning to the referrer
referralsRouter.post("/:id/earnings", requireRole("EMPLOYEE", "MANAGER", "ADMIN"), async (req: AuthRequest, res: Response) => {
  const { amount, note } = req.body as { amount: number; note?: string };
  if (!amount) { res.status(400).json({ error: "amount is required" }); return; }

  try {
    const referral = await prisma.referral.findUnique({ 
      where: { id: req.params.id },
      include: { referrer: { select: { name: true, mobile: true } } }
    });
    if (!referral) { res.status(404).json({ error: "Referral not found" }); return; }
    if (!referral.isActive) { res.status(400).json({ error: "This referral is no longer active" }); return; }

    const earning = await prisma.referralEarning.create({
      data: { referralId: referral.id, amount, note: note ?? null }
    });

    // Send SMS Alert to Referrer if enabled
    if (referral.referrer.mobile && await FeatureFlags.isEnabled("SMS_ALERTS")) {
      SMSService.sendAlert(
        referral.referrer.mobile,
        "RGT_COMMISSION",
        [referral.referrer.name, amount.toString()]
      ).catch(err => console.error("Post-earning SMS background error:", err));
    }

    res.status(201).json(earning);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to credit earning" });
  }
});

// ── POST /api/referrals/withdraw ──────────────────────────────────────────────
// Investor withdraws only their referral earnings (separate from main portfolio)
referralsRouter.post("/withdraw", async (req: AuthRequest, res: Response) => {
  if (req.user?.type !== "investor") {
    res.status(403).json({ error: "Only investors can withdraw referral earnings" });
    return;
  }
  try {
    // Mark all pending earnings for this investor as withdrawn
    const updated = await prisma.referralEarning.updateMany({
      where: {
        isWithdrawn: false,
        referral: { referrerId: req.user.id }
      },
      data: { isWithdrawn: true }
    });
    res.json({ message: `Referral earnings withdrawal processed`, count: updated.count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process withdrawal" });
  }
});
