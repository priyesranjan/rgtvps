import { prisma } from "../lib/prisma";
import ProductService from "./ProductService";
import PaymentService from "./PaymentService";
import { AuditAction, Prisma, Role } from "@prisma/client";
import { AuditService } from "./AuditService";

const STAFF_INCENTIVE_PER_ORDER = 500;

class OrderService {
  /**
   * Create a new purchase order
   * @param userId The ID of the user buying
   * @param productId The Gold Coin to buy
   * @param quantity Number of coins
   */
  async createPurchaseOrder(userId: string, productId: string, quantity: number) {
    // 1. Get Product & Live Price
    const product = await ProductService.getProductById(productId);
    if (!product) throw new Error("Product not found");
    if (!Number.isInteger(quantity) || quantity <= 0) throw new Error("Quantity must be a positive integer");
    if (product.stock < quantity) throw new Error("Out of stock");

    const livePriceObj = await ProductService.getLatestGoldPrice();
    if (!livePriceObj) throw new Error("Live gold price not available");

    const livePrice = Number(livePriceObj.sellPrice);

    // 2. Calculate Pricing (Weight * Price * 1.03)
    const pricing = ProductService.calculateEffectivePrice(product, livePrice);
    const subtotal = pricing.goldValue * quantity;
    const gstTotal = pricing.gstAmount * quantity;
    const totalAmount = pricing.total * quantity;

    // 3. Create Database Order (Pending)
    const order = await prisma.order.create({
      data: {
        userId,
        productId,
        quantity,
        amount: new Prisma.Decimal(subtotal),
        gst: new Prisma.Decimal(gstTotal),
        total: new Prisma.Decimal(totalAmount),
        status: "PENDING",
        paymentStatus: "PENDING",
      },
    });

    // 4. Create Razorpay Order
    const razorpayOrder = await PaymentService.createRazorpayOrder(
      totalAmount,
      order.id
    );

    // 5. Link Razorpay Order ID to our local Order
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentId: razorpayOrder.id },
    });

    return {
      orderId: order.id,
      invoiceNo: order.invoiceNo,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
      currency: "INR",
    };
  }

  /**
   * Complete the order after payment verification
   */
  async verifyAndFinalizeOrder(
    userId: string,
    orderId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    // 1. Verify Signature
    const isValid = PaymentService.verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) throw new Error("Invalid payment signature");

    // 2. Fetch Order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        product: true,
        user: {
          select: {
            id: true,
            staffId: true,
          },
        },
      }
    });

    if (!order || order.userId !== userId) throw new Error("Order not found");
    if (order.status === "PAID" || order.status === "READY" || order.status === "DELIVERED") return order;
    if (order.paymentId !== razorpayOrderId) throw new Error("Order mismatch for payment verification");

    if (order.product.stock < order.quantity) {
      throw new Error("Insufficient stock during payment confirmation");
    }

    // 3. Update Order Status
    return await prisma.$transaction(async (tx) => {
      const paidAt = new Date();
      const expectedDeliveryDate = new Date(paidAt.getTime() + 15 * 24 * 60 * 60 * 1000);

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          paymentStatus: "SUCCESS",
          razorpayPaymentId,
          razorpaySignature,
          paidAt,
          expectedDeliveryDate,
        },
      });

      // Reduce Stock
      await tx.product.update({
        where: { id: order.productId },
        data: { stock: { decrement: order.quantity } },
      });

      // Credit fixed incentive to assigned staff only after successful payment.
      if (order.user?.staffId) {
        const staffId = order.user.staffId;
        const incentiveAmount = new Prisma.Decimal(STAFF_INCENTIVE_PER_ORDER);

        await tx.staffCommission.create({
          data: {
            staffId,
            customerId: userId,
            amount: incentiveAmount,
          },
        });

        const updatedStaffWallet = await tx.wallet.upsert({
          where: { userId: staffId },
          create: {
            userId: staffId,
            staffCommissionBalance: incentiveAmount,
            totalWithdrawable: incentiveAmount,
            balance: incentiveAmount,
          },
          update: {
            staffCommissionBalance: { increment: incentiveAmount },
            totalWithdrawable: { increment: incentiveAmount },
            balance: { increment: incentiveAmount },
          },
        });

        await tx.transaction.create({
          data: {
            userId: staffId,
            type: "STAFF_COMMISSION",
            amount: incentiveAmount,
            balanceAfter: updatedStaffWallet.balance,
            performedById: userId,
            description: `₹${STAFF_INCENTIVE_PER_ORDER} incentive for customer order ${orderId}`,
            entityId: orderId,
          },
        });
      }

      // Log the event
      await tx.auditLog.create({
        data: {
          actionType: "ORDER_PURCHASED",
          entityType: "ORDER",
          entityId: orderId,
          performedByUserId: userId,
          performedByRole: Role.CUSTOMER,
          description: `Order ${orderId} successfully purchased for ${order.total} INR`,
          newData: { orderId, total: order.total, quantity: order.quantity },
        },
      });

      return updatedOrder;
    });
  }

  async markOrderReady(orderId: string, actorUserId: string, actorRole: Role, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    if (order.status !== "PAID") throw new Error("Only paid orders can be marked ready");

    // Generate token number: RGT-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const tokenNumber = `RGT-${dateStr}-${rand}`;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "READY",
          readyAt: new Date(),
          readyMarkedById: actorUserId,
          tokenNumber,
          notes: notes || order.notes,
        },
      });

      await AuditService.logAction({
        actionType: AuditAction.ORDER_READY,
        entityType: "Order",
        entityId: orderId,
        performedByUserId: actorUserId,
        performedByRole: actorRole,
        description: `Order ${orderId} marked READY by ${actorRole}`,
        newData: { status: "READY", notes },
      });

      return updated;
    });
  }

  async markOrderDelivered(orderId: string, actorUserId: string, actorRole: Role, notes?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    if (order.status !== "READY") throw new Error("Only READY orders can be marked delivered");

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "DELIVERED",
          deliveredAt: new Date(),
          notes: notes || order.notes,
        },
      });

      await AuditService.logAction({
        actionType: AuditAction.ORDER_DELIVERED,
        entityType: "Order",
        entityId: orderId,
        performedByUserId: actorUserId,
        performedByRole: actorRole,
        description: `Order ${orderId} marked DELIVERED by ${actorRole}`,
        newData: { status: "DELIVERED", notes },
      });

      return updated;
    });
  }

  async markOrderPaymentFailed(userId: string, orderId: string, reason?: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) throw new Error("Order not found");

    if (order.paymentStatus === "SUCCESS") {
      throw new Error("Paid orders cannot be marked failed");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        paymentStatus: "FAILED",
        notes: reason || order.notes || "Payment failed",
      },
    });
  }

  /**
   * Get purchase history for a user
   */
  async getUserOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async listAllOrders() {
    return prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Customer chooses to withdraw the order amount instead of picking up.
   * Only allowed for READY orders.
   */
  async withdrawOrderAmount(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });
    if (!order || order.userId !== userId) throw new Error("Order not found");
    if (order.status !== "READY") throw new Error("Only READY orders can be withdrawn. Please wait for admin to mark your order ready.");

    const refundAmount = Number(order.total);

    return await prisma.$transaction(async (tx) => {
      // Mark order as CANCELLED with withdrawal note
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          notes: `Customer opted for amount withdrawal (₹${refundAmount}) instead of pickup`,
        },
      });

      // Restore product stock
      await tx.product.update({
        where: { id: order.productId },
        data: { stock: { increment: order.quantity } },
      });

      // Credit amount to customer wallet
      const updatedWallet = await tx.wallet.upsert({
        where: { userId },
        create: {
          userId,
          balance: new Prisma.Decimal(refundAmount),
          goldAdvanceAmount: new Prisma.Decimal(refundAmount),
          totalWithdrawable: new Prisma.Decimal(refundAmount),
        },
        update: {
          balance: { increment: refundAmount },
          goldAdvanceAmount: { increment: refundAmount },
          totalWithdrawable: { increment: refundAmount },
        },
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId,
          type: "DEPOSIT",
          amount: new Prisma.Decimal(refundAmount),
          balanceAfter: updatedWallet.balance,
          description: `Order refund — chose withdrawal over pickup (Order #${order.invoiceNo})`,
          entityId: orderId,
        },
      });

      await AuditService.logAction({
        actionType: AuditAction.ORDER_DELIVERED,
        entityType: "Order",
        entityId: orderId,
        performedByUserId: userId,
        performedByRole: Role.CUSTOMER,
        description: `Customer withdrew order ${orderId} amount: ₹${refundAmount}`,
        newData: { status: "CANCELLED", refundAmount },
      });

      return { refundAmount, orderId };
    });
  }
}

export default new OrderService();
