import { Router } from "express";
import { ProductController } from "../controllers/ProductController";
import { requireAuth, requireRole } from "../middleware/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", ProductController.listProducts);
router.get(
  "/admin/gold-price/current",
  requireAuth,
  requireRole(Role.ADMIN),
  ProductController.getCurrentGoldPrice
);
router.get(
  "/admin/all",
  requireAuth,
  requireRole(Role.ADMIN),
  ProductController.listAllProductsAdmin
);
router.get("/:id", ProductController.getProduct);

// Admin only routes
router.post(
  "/",
  requireAuth,
  requireRole(Role.ADMIN),
  ProductController.createProduct
);
router.put(
  "/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  ProductController.updateProduct
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(Role.ADMIN),
  ProductController.deleteProduct
);
router.post(
  "/admin/gold-price",
  requireAuth,
  requireRole(Role.ADMIN),
  ProductController.setCurrentGoldPrice
);

export default router;
