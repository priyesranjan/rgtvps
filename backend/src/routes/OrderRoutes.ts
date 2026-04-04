import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/start", requireAuth, OrderController.startPurchase);
router.post("/verify", requireAuth, OrderController.verifyPayment);
router.get("/my", requireAuth, OrderController.myOrders);

export default router;
