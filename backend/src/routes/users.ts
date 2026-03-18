import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole, AuthRequest } from "../middleware/auth";

export const usersRouter = Router();

usersRouter.use(requireAuth);

// ── GET /api/users/:id ────────────────────────────────────────────────────────
// Investor profile with account-creation attribution
usersRouter.get("/:id", async (req: AuthRequest, res: Response) => {
  if (req.user?.type === "investor" && req.user.id !== req.params.id) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        createdByEmployee: {
          select: { id: true, name: true, employeeCode: true, createdAt: true }
        },
        investments: {
          include: {
            processedByEmployee: { select: { name: true, employeeCode: true } },
            rateChangeLogs: {
              include: { changedByEmployee: { select: { name: true, employeeCode: true } } },
              orderBy: { changedAt: "desc" }
            }
          },
          orderBy: { processedAt: "desc" }
        }
      }
    });
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    const { passwordHash: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ── POST /api/users ───────────────────────────────────────────────────────────
// Employee creates a new investor account (tags themselves as creator)
usersRouter.post("/", requireRole("EMPLOYEE", "MANAGER", "ADMIN"), async (req: AuthRequest, res: Response) => {
  const { name, mobile, email, password } = req.body as {
    name: string; mobile: string; email?: string; password: string;
  };

  if (!name || !mobile || !password) {
    res.status(400).json({ error: "name, mobile and password are required" });
    return;
  }

  try {
    const existing = await prisma.user.findUnique({ where: { mobile } });
    if (existing) { res.status(409).json({ error: "Mobile already registered" }); return; }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        mobile,
        email: email ?? null,
        passwordHash,
        createdByEmployeeId: req.user!.id,  // ← attribution tag
      },
      include: {
        createdByEmployee: { select: { name: true, employeeCode: true } }
      }
    });

    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  }
});
