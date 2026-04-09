import { Request, Response, NextFunction } from "express";
import ProductService from "../services/ProductService";
import { successResponse, errorResponse } from "../utils/response";

export class ProductController {
  /**
   * Get all active gold coins
   */
  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getAllProducts();
      const livePriceObj = await ProductService.getLatestGoldPrice();
      
      const livePrice = livePriceObj ? Number(livePriceObj.sellPrice) : 0;

      // Map products with current dynamic pricing
      const productsWithPrice = products.map(p => ({
        ...p,
        pricing: ProductService.calculateEffectivePrice(p, livePrice)
      }));

      return successResponse(
        res,
        {
          products: productsWithPrice,
          livePrice,
          priceSource: "ADMIN_SET",
          priceLastUpdatedAt: livePriceObj?.timestamp || null,
        },
        "Products fetched"
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product by ID with precise pricing
   */
  static async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await ProductService.getProductById(id as string);
      
      if (!product) return errorResponse(res, "Product not found", 404);

      const livePriceObj = await ProductService.getLatestGoldPrice();
      const livePrice = livePriceObj ? Number(livePriceObj.sellPrice) : 0;
      
      const pricing = ProductService.calculateEffectivePrice(product, livePrice);

      return successResponse(res, { product, pricing }, "Product details fetched");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new gold coin (Admin only)
   */
  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, weight, purity, stock, imageUrl } = req.body;
      
      if (!name || !weight) {
        return errorResponse(res, "Name and Weight are required", 400);
      }

      const product = await ProductService.createProduct({
        name,
        description,
        weight: Number(weight),
        purity: purity || "24K",
        stock: Number(stock) || 0,
        imageUrl,
      });

      return successResponse(res, { product }, "Product created successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin fetches current live gold price used for coin pricing
   */
  static async getCurrentGoldPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const livePriceObj = await ProductService.getLatestGoldPrice();
      if (!livePriceObj) {
        return errorResponse(res, "Gold price is not set by admin yet", 404);
      }

      return successResponse(res, { goldPrice: livePriceObj, priceSource: "ADMIN_SET" }, "Current gold price fetched");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin lists ALL products (including inactive)
   */
  static async listAllProductsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await ProductService.getAllProductsAdmin();
      const livePriceObj = await ProductService.getLatestGoldPrice();
      const livePrice = livePriceObj ? Number(livePriceObj.sellPrice) : 0;

      const productsWithPrice = products.map(p => ({
        ...p,
        pricing: ProductService.calculateEffectivePrice(p, livePrice)
      }));

      return successResponse(res, { products: productsWithPrice, livePrice }, "All products fetched");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin updates a product
   */
  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { name, description, weight, purity, stock, imageUrl, isActive } = req.body;

      const existing = await ProductService.getProductById(id);
      if (!existing) return errorResponse(res, "Product not found", 404);

      const product = await ProductService.updateProduct(id, {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(weight !== undefined && { weight: Number(weight) }),
        ...(purity !== undefined && { purity }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
      });

      return successResponse(res, { product }, "Product updated successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin deletes (soft) a product
   */
  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const existing = await ProductService.getProductById(id);
      if (!existing) return errorResponse(res, "Product not found", 404);

      await ProductService.deleteProduct(id);
      return successResponse(res, null, "Product deactivated");
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin sets a new gold price snapshot used in product/order pricing
   */
  static async setCurrentGoldPrice(req: Request, res: Response, next: NextFunction) {
    try {
      const { buyPrice, sellPrice } = req.body;

      const buy = Number(buyPrice);
      const sell = Number(sellPrice);

      if (!Number.isFinite(buy) || !Number.isFinite(sell) || buy <= 0 || sell <= 0) {
        return errorResponse(res, "buyPrice and sellPrice must be valid positive numbers", 400);
      }

      const goldPrice = await ProductService.setGoldPrice({ buyPrice: buy, sellPrice: sell });

      return successResponse(res, { goldPrice, priceSource: "ADMIN_SET" }, "Gold price updated successfully", 201);
    } catch (error) {
      next(error);
    }
  }
}
