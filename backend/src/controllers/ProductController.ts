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

      return successResponse(res, { products: productsWithPrice, livePrice }, "Products fetched");
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
}
