import { Router } from "express";
import { AuditController } from "../controllers/AuditController";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

export const auditRouter = Router();

// Get all logs (Admin roles)
auditRouter.get("/", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AuditController.getLogs);

// Get logs for a specific entity
auditRouter.get("/:entityType/:entityId", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN, Role.STAFF), AuditController.getEntityLogs);
