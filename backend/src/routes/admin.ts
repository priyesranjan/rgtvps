import { Router } from "express";
import { AdminController } from "../controllers/AdminController";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

export const adminRouter = Router();

adminRouter.get("/staff/list", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.listAllStaff);
adminRouter.get("/users", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getUsers);
adminRouter.post("/users", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.createUser);
adminRouter.patch("/users/:userId", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.updateUser);
adminRouter.delete("/users/:userId", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.deleteUser);
adminRouter.post("/reassign-staff", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.reassignStaff);
adminRouter.get("/transactions", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getAllTransactions);
adminRouter.get("/transactions/:userId", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getUserTransactions);
adminRouter.get("/stats", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.getDashboardStats);
adminRouter.patch("/users/:userId", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), AdminController.updateUser);
