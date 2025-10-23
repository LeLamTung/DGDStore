import { Request, Response } from "express";
import CartService from "@services/clientServices/cart.service";

class CartController {
  // Thêm sản phẩm vào giỏ hàng
  static async AddtoCart(req: Request, res: Response) {
    try {
      // Lấy giỏ hàng sau khi thêm sản phẩm
      const cart = await CartService.addToCart(req);

      // Trả về giỏ hàng với thông điệp
      const data = {
        message: "Product added to cart",
        data: cart,
      };
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Error adding product to cart" });
    }
  }

  // Lấy thông tin giỏ hàng
  static async GetCart(req: Request, res: Response) {
    try {
      // Lấy giỏ hàng
      const cart = await CartService.getCart(req);

      // Trả về giỏ hàng với thông điệp
      const data = {
        message: "Cart fetched successfully",
        data: cart,
      };
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Error fetching cart" });
    }
  }
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  static async updateProductQuantity(req: Request, res: Response) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ message: "Thiếu productId hoặc quantity" });
    }

    // Gọi service cập nhật giỏ hàng
    const cart = await CartService.updateProductQuantity(req, productId, quantity);

    res.json({
      message: "Cập nhật số lượng sản phẩm thành công",
      data: cart,
    });

  } catch (err: any) {
    console.error(" Lỗi updateProductQuantity:", err);

    // 🔥 Trả về đúng message từ service
    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Lỗi mặc định
    res.status(500).json({
      message: err.message || "Lỗi server khi cập nhật số lượng sản phẩm",
    });
  }
}

  // Xóa sản phẩm khỏi giỏ hàng
  static async removeProductFromCart(req: Request, res: Response) {
    try {
      const productId = parseInt(req.params.id, 10);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid productId" });
      }

      // Xóa sản phẩm khỏi giỏ hàng
      const cart = await CartService.removeProductFromCart(req, Number(productId));

      // Trả về giỏ hàng sau khi xóa
      const data = {
        message: "Product removed from cart",
        // data: cart,
      };
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Error removing product from cart" });
    }
  }
}

export default CartController;
