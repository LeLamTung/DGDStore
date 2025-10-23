import { Request } from "express";
import { AppDataSource } from "@databases/data-source";
import Cart from "@entities/Cart";
import Products from "@entities/Products";
import Users from "@entities/Users";

// ✅ Repository toàn cục, an toàn vì AppDataSource đã initialize trước khi router chạy
const userRepo = AppDataSource.getRepository(Users);
const productRepo = AppDataSource.getRepository(Products);
const cartRepo = AppDataSource.getRepository(Cart);

class CartService {
  /** 🛒 Thêm sản phẩm vào giỏ hàng */
  static async addToCart(req: Request) {
    const { productId, quantity } = req.body;
    const parsedQuantity = Number(quantity);

    if (!productId || isNaN(parsedQuantity) || parsedQuantity <= 0) {
      throw new Error("Invalid productId or quantity");
    }

    const userId = (req.user as any)?.userId;
    if (!userId) throw new Error("User not authenticated");

    const user = await userRepo.findOne({ where: { idUser: Number(userId) } });
    if (!user) throw new Error("User not found");

    const product = await productRepo.findOne({
      where: { idProduct: productId },
      relations: ["Category"],
    });
    if (!product) throw new Error("Product not found");

    // Lấy item trong cart nếu đã tồn tại
    let cartItem = await cartRepo.findOne({
      where: {
        User: { idUser: Number(userId) },
        Products: { idProduct: productId },
      },
      relations: ["Products", "User"],
    });

    if (cartItem) {
      const newQty = (cartItem.quantity || 0) + parsedQuantity;

      if (newQty > (product.Stock || 0)) {
        throw new Error(`Không đủ tồn kho. Hiện tại chỉ còn ${product.Stock}`);
      }

      cartItem.quantity = newQty;
      cartItem.TotalPrice = (product.SalePrice || 0) * newQty;
    } else {
      if (parsedQuantity > (product.Stock || 0)) {
        throw new Error(`Không đủ tồn kho. Hiện tại chỉ còn ${product.Stock}`);
      }

      cartItem = cartRepo.create({
        quantity: parsedQuantity,
        TotalPrice: (product.SalePrice || 0) * parsedQuantity,
        Products: product,
        User: user,
      });
    }

    await cartRepo.save(cartItem);
    return await this.getCart(req);
  }

  /** 📋 Lấy danh sách giỏ hàng của người dùng */
  static async getCart(req: Request) {
    const userId = (req.user as any)?.userId;
    if (!userId) throw new Error("User not authenticated");

    const cartItems = await cartRepo.find({
      where: { User: { idUser: Number(userId) } },
      relations: ["Products", "Products.Category"],
      order: { idCart: "DESC" },
    });

    return cartItems.map((item) => ({
      idCart: item.idCart,
      productId: item.Products?.idProduct,
      ProductName: item.Products?.ProductName,
      ImageName: item.Products?.ImageName,
      CategoryName: item.Products?.Category?.CategoryName,
      SalePrice: item.Products?.SalePrice,
      quantity: item.quantity,
      TotalPrice: item.TotalPrice,
    }));
  }

  /**  Cập nhật số lượng sản phẩm trong giỏ hàng */
 static async updateProductQuantity(req: Request, productId: number, quantity: number) {
  const userId = (req.user as any)?.userId;
  if (!userId) throw new Error("User not authenticated");

  const parsedQuantity = Number(quantity);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error("Số lượng phải lớn hơn 0");
  }

  const item = await cartRepo.findOne({
    where: {
      User: { idUser: Number(userId) },
      Products: { idProduct: productId },
    },
    relations: ["Products"],
  });

  if (!item) throw new Error("Sản phẩm không tồn tại trong giỏ hàng");

  const stock = item.Products?.Stock ?? 0;
  if (parsedQuantity > stock) {
    // 🚫 Không đủ tồn kho
    const error = new Error(`Không đủ tồn kho. Hiện tại chỉ còn ${stock} sản phẩm.`);
    (error as any).statusCode = 400; // gán mã lỗi 400 cho controller đọc được
    throw error;
  }

  item.quantity = parsedQuantity;
  item.TotalPrice = (item.Products?.SalePrice || 0) * parsedQuantity;

  await cartRepo.save(item);

  // ✅ Trả về giỏ hàng mới
  return await this.getCart(req);
}

  /**  Xóa sản phẩm khỏi giỏ hàng */
  static async removeProductFromCart(req: Request, productId: number) {
    const userId = (req.user as any)?.userId;
    if (!userId) throw new Error("User not authenticated");

    const item = await cartRepo.findOne({
      where: {
        User: { idUser: Number(userId) },
        Products: { idProduct: productId },
      },
    });

    if (!item) throw new Error("Product not found in cart");

    await cartRepo.remove(item);
    return await this.getCart(req);
  }

  /** 🗑️ Xóa toàn bộ giỏ hàng */
  static async clearCart(req: Request) {
    const userId = (req.user as any)?.userId;
    if (!userId) throw new Error("User not authenticated");

    await cartRepo.delete({ User: { idUser: Number(userId) } });
    return [];
  }
}

export default CartService;
