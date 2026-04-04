import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", ProductController.listProducts);
router.get("/:id", ProductController.getProduct);

// Admin only routes
router.post(
  "/",
  requireAuth,
  requireRole(Role.ADMIN),
  ProductController.createProduct
);

export default router;
