import { Request, Response } from "express";
import CartService from "@services/clientServices/cart.service";

class CartController {
  // Thêm sản phẩm vào giỏ hàng
  // Hàm helper để lấy UserId (tránh lặp code)
  private static getUserId(req: Request): number {
      const userId = (req.user as any)?.userId;
      if (!userId) throw { statusCode: 401, message: "Bạn chưa đăng nhập" };
      return Number(userId);
  }
  static async AddtoCart(req: Request, res: Response) {
    try {
      const userId = CartController.getUserId(req);
      const { productId, quantity } = req.body;

      const cart = await CartService.addToCart(userId, productId, quantity);
      
      return res.status(200).json({
        message: "Product added to cart",
        data: cart,
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ message: err.message || "Error adding product to cart" });
    }
  }

  static async GetCart(req: Request, res: Response) {
    try {
      const userId = CartController.getUserId(req);
      const cart = await CartService.getCart(userId);
      
      return res.status(200).json({
        message: "Cart fetched successfully",
        data: cart,
      });
    } catch (err: any) {
      const status = err.statusCode || 500;
      return res.status(status).json({ message: err.message });
    }
  }

  static async updateProductQuantity(req: Request, res: Response) {
    try {
        const userId = CartController.getUserId(req);
        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
             return res.status(400).json({ message: "Thiếu productId hoặc quantity" });
        }

        const cart = await CartService.updateProductQuantity(userId, productId, quantity);
        return res.status(200).json({
            message: "Cập nhật thành công",
            data: cart,
        });
    } catch (err: any) {
        const status = err.statusCode || 500;
        return res.status(status).json({ message: err.message });
    }
  }

  static async removeProductFromCart(req: Request, res: Response) {
    try {
        const userId = CartController.getUserId(req);
        const productId = parseInt(req.params.id, 10);
        if (isNaN(productId)) return res.status(400).json({ message: "Invalid productId" });

        const cart = await CartService.removeProductFromCart(userId, productId);
        return res.status(200).json({
            message: "Product removed from cart",
            data: cart
        });
    } catch (err: any) {
        const status = err.statusCode || 500;
        return res.status(status).json({ message: err.message });
    }
  }
}

export default CartController;
