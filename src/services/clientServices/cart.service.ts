import { Request, Response } from "express";
import "express-session";
import { AppDataSource } from "@databases/data-source";
import Products from "@entities/Products";

// Định nghĩa kiểu cho sản phẩm trong giỏ hàng
interface CartItem {
  productId: number;
  quantity: number;
  ProductName: string;
  ImageName: string;
  SalePrice: number;
  CategoryName: string;
}

declare module "express-session" {
  interface SessionData {
    cart: CartItem[]; // Định nghĩa kiểu giỏ hàng sử dụng CartItem
  }
}

class CartService {
  //thêm vào giỏ hàng
  static async addToCart(req: Request) {
    const { productId, quantity } = req.body;
    const parsed = Number(quantity);

    if (!productId || !quantity || quantity <= 0) {
      throw new Error("Invalid productId or quantity");
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const productRepo = AppDataSource.getRepository(Products);
    const product = await productRepo.findOne({
      where: { idProduct: productId },
      relations: ['Category'],  // Kết nối bảng Category
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = req.session.cart.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      // Nếu có rồi, chỉ tăng số lượng
      existingItem.quantity = (existingItem.quantity || 0) + parsed;
    } else {
      // Nếu chưa, thêm mới vào giỏ
      req.session.cart.push({
        productId,
        quantity: parsed,
        ProductName: product.ProductName ?? "", // Nếu undefined thì lấy chuỗi rỗng
        ImageName: product.ImageName ?? "",     
        SalePrice: product.SalePrice ?? 0,      // Nếu undefined thì lấy 0
        CategoryName: product.Category?.CategoryName ?? "", 
      });
    }

    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      }
    });

    // Trả về giỏ hàng sau khi thêm sản phẩm
    return req.session.cart;
  }

  //hiển thị thông tin trong giỏ
  static async getCart(req: Request) {
    try {
      // Trả về giỏ hàng từ session
      return req.session.cart || [];
    } catch (err) {
      console.error("Error fetching cart:", err);
      throw new Error("Failed to fetch cart");
    }
  }
  static async updateProductQuantity(req: Request, productId: number, quantity: number) {
    const parsedQuantity = Number(quantity);

    if (!productId || parsedQuantity <= 0) {
      throw new Error("Invalid productId or quantity");
    }

    const productRepo = AppDataSource.getRepository(Products);
    const product = await productRepo.findOne({
      where: { idProduct: productId },
      relations: ['Category'],
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Kiểm tra nếu giỏ hàng đã tồn tại trong session
    if (!req.session.cart) {
      req.session.cart = [];
    }

    const existingItem = req.session.cart.find((item) => item.productId === productId);

    if (existingItem) {
      // Cập nhật số lượng sản phẩm
      existingItem.quantity = parsedQuantity;
    } else {
      throw new Error("Product not found in cart");
    }

    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      }
    });

    return req.session.cart;
  }

  // Xóa sản phẩm khỏi giỏ hàng
  static async removeProductFromCart(req: Request, productId: number) {
    // Kiểm tra nếu giỏ hàng đã tồn tại trong session
    if (!req.session.cart) {
      req.session.cart = [];
    }

    // Tìm và xóa sản phẩm khỏi giỏ hàng
    req.session.cart = req.session.cart.filter(
      item => Number(item.productId) !== Number(productId)
    );
    

    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      } else {
        console.log("Session saved after removal");
      }
    });
    

    return req.session.cart;
  }

}
export default CartService;
