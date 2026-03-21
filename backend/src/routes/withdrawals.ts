import { Router } from "express";
import { WithdrawalController } from "../controllers/WithdrawalController";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

export const withdrawalRouter = Router();

// Submission Endpoints
withdrawalRouter.post("/request", requireAuth, requireRole(Role.CUSTOMER, Role.STAFF, Role.ADMIN), WithdrawalController.request);
withdrawalRouter.get("/", requireAuth, requireRole(Role.CUSTOMER), WithdrawalController.list);
withdrawalRouter.get("/:id/invoice", WithdrawalController.getInvoice);

// Admin Endpoints
withdrawalRouter.get("/admin/all", requireAuth, requireRole(Role.ADMIN), WithdrawalController.adminList);
withdrawalRouter.post("/admin/approve", requireAuth, requireRole(Role.ADMIN), WithdrawalController.approve);
withdrawalRouter.post("/admin/reject", requireAuth, requireRole(Role.ADMIN), WithdrawalController.reject);

// Staff Endpoints
withdrawalRouter.get("/staff", requireAuth, requireRole(Role.STAFF), WithdrawalController.staffList);
