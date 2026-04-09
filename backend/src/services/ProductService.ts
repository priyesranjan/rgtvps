import { prisma } from "../lib/prisma";
import { Product, GoldPrice, Prisma } from "@prisma/client";

class ProductService {
  /**
   * Get all active products
   */
  async getAllProducts() {
    return await prisma.product.findMany({
      where: { isActive: true },
    });
  }

  /**
   * Get all products including inactive (admin)
   */
  async getAllProductsAdmin() {
    return await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update a product
   */
  async updateProduct(id: string, data: Partial<{
    name: string;
    description: string | null;
    weight: number;
    purity: string;
    imageUrl: string | null;
    stock: number;
    isActive: boolean;
  }>) {
    const updateData: any = { ...data };
    if (data.weight !== undefined) {
      updateData.weight = new Prisma.Decimal(data.weight);
    }
    return await prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a product (soft delete by setting isActive = false)
   */
  async deleteProduct(id: string) {
    return await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Get a single product by ID
   */
  async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new product
   */
  async createProduct(data: {
    name: string;
    description?: string;
    weight: number;
    purity: string;
    imageUrl?: string;
    stock: number;
  }) {
    return await prisma.product.create({
      data: {
        ...data,
        weight: new Prisma.Decimal(data.weight),
      },
    });
  }

  /**
   * Get the latest gold price from the database
   */
  async getLatestGoldPrice(): Promise<GoldPrice | null> {
    return await prisma.goldPrice.findFirst({
      orderBy: { timestamp: "desc" },
    });
  }

  /**
   * Admin sets a new live gold price snapshot.
   */
  async setGoldPrice(data: { buyPrice: number; sellPrice: number }) {
    return prisma.goldPrice.create({
      data: {
        buyPrice: new Prisma.Decimal(data.buyPrice),
        sellPrice: new Prisma.Decimal(data.sellPrice),
      },
    });
  }

  /**
   * Calculate the current price of a product including 3% GST
   * @param product The product object
   * @param livePrice The current gold price per gram
   * @returns object with breaking down of price
   */
  calculateEffectivePrice(product: Product, livePrice: number) {
    const weight = Number(product.weight);
    const goldValue = weight * livePrice;
    
    // 3% GST
    const gstAmount = goldValue * 0.03;
    const total = goldValue + gstAmount;

    return {
      goldValue: Number(goldValue.toFixed(2)),
      gstAmount: Number(gstAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
      purity: product.purity,
      weight: weight,
    };
  }
}

export default new ProductService();
