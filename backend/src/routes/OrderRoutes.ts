import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

router.post("/start", requireAuth, OrderController.startPurchase);
router.post("/verify", requireAuth, OrderController.verifyPayment);
router.post("/fail", requireAuth, OrderController.failPayment);
router.post("/withdraw", requireAuth, OrderController.withdrawOrder);
router.get("/my", requireAuth, OrderController.myOrders);
router.get("/:id/invoice", requireAuth, OrderController.getInvoice);

router.get("/admin/all", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN, Role.STAFF), OrderController.allOrders);
router.post("/admin/mark-ready", requireAuth, requireRole(Role.STAFF, Role.ADMIN, Role.SUPERADMIN), OrderController.markReady);
router.post("/admin/mark-delivered", requireAuth, requireRole(Role.ADMIN, Role.SUPERADMIN), OrderController.markDelivered);

export default router;
