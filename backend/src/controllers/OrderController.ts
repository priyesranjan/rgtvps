import { Response, NextFunction } from "express";
import OrderService from "../services/OrderService";
import { AuthRequest } from "../middleware/auth";
import { successResponse, errorResponse } from "../utils/response";
import { InvoiceService } from "../services/InvoiceService";

export class OrderController {
  /**
   * Start a purchase (Create Order + Razorpay Order)
   */
  static async startPurchase(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity } = req.body;
      const userId = req.user!.id;

      if (!productId || !quantity) {
        return errorResponse(res, "Product ID and Quantity are required", 400);
      }

      const orderData = await OrderService.createPurchaseOrder(userId, productId, Number(quantity));
      
      return successResponse(res, orderData, "Order initiated successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify the payment from the mobile app
   */
  static async verifyPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const userId = req.user!.id;

      if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return errorResponse(res, "All payment verification fields are required", 400);
      }

      const order = await OrderService.verifyAndFinalizeOrder(
        userId,
        orderId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      return successResponse(res, { order }, "Payment verified and order completed");
    } catch (error) {
      next(error);
    }
  }

  static async failPayment(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, reason } = req.body;
      const userId = req.user!.id;

      if (!orderId) {
        return errorResponse(res, "orderId is required", 400);
      }

      const order = await OrderService.markOrderPaymentFailed(userId, orderId, reason);
      return successResponse(res, { order }, "Order marked as payment failed");
    } catch (error) {
      next(error);
    }
  }

  /**
   * List all orders for the current user
   */
  static async myOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const orders = await OrderService.getUserOrders(userId);

      return successResponse(res, { orders }, "Orders fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async allOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.listAllOrders();
      return successResponse(res, { orders }, "All orders fetched successfully");
    } catch (error) {
      next(error);
    }
  }

  static async markReady(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, notes } = req.body;
      const actorUserId = req.user!.id;
      const actorRole = req.user!.role;

      if (!orderId) return errorResponse(res, "orderId is required", 400);
      const order = await OrderService.markOrderReady(orderId, actorUserId, actorRole, notes);
      return successResponse(res, { order }, "Order marked ready");
    } catch (error) {
      next(error);
    }
  }

  static async markDelivered(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, notes } = req.body;
      const actorUserId = req.user!.id;
      const actorRole = req.user!.role;

      if (!orderId) return errorResponse(res, "orderId is required", 400);
      const order = await OrderService.markOrderDelivered(orderId, actorUserId, actorRole, notes);
      return successResponse(res, { order }, "Order marked delivered");
    } catch (error) {
      next(error);
    }
  }

  static async getInvoice(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const html = await InvoiceService.generateOrderInvoiceHtml(id);
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Customer opts to withdraw order amount instead of pickup (READY orders only)
   */
  static async withdrawOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.body;
      const userId = req.user!.id;

      if (!orderId) return errorResponse(res, "Order ID is required", 400);

      const result = await OrderService.withdrawOrderAmount(orderId, userId);
      return successResponse(res, result, `₹${result.refundAmount} credited to your wallet`);
    } catch (error) {
      next(error);
    }
  }
}
