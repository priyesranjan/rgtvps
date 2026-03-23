import { Router } from "express";
import { AdminCronController } from "../controllers/AdminCronController";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

// Only Superadmins can view and trigger cron actions
router.get("/logs", requireAuth, requireRole(Role.SUPERADMIN), AdminCronController.getCronLogs);
router.post("/trigger", requireAuth, requireRole(Role.SUPERADMIN), AdminCronController.triggerDistribution);

export { router as adminCronRouter };
