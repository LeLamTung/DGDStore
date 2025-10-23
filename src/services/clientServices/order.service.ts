import { AppDataSource } from "@databases/data-source";
import Order from "@entities/Order";
import OrderDetail from "@entities/OrderDetail";
import Products from "@entities/Products";
import Cart from "@entities/Cart";
import Users from "@entities/Users";
import { Request } from "express";

const OrderRepository = AppDataSource.getRepository(Order);
const OrderDetailRepository = AppDataSource.getRepository(OrderDetail);
const ProductRepository = AppDataSource.getRepository(Products);
const CartRepository = AppDataSource.getRepository(Cart);
const UserRepository = AppDataSource.getRepository(Users);

class OrderService {
  /** 🧾 Tạo đơn hàng thanh toán COD */
  static async createOrder(req: Request) {
    const { CustomerName, PhoneNumber, Address, Notes, PaymentMethod } = req.body;
    const userId = (req.user as any)?.userId;

    if (!userId) throw new Error("User not authenticated");

    const user = await UserRepository.findOne({ where: { idUser: Number(userId) } });
    if (!user) throw new Error("User not found");

    // 🛒 Lấy giỏ hàng
    const cartItems = await CartRepository.find({
      where: { User: { idUser: user.idUser } },
      relations: ["Products"],
    });
    if (cartItems.length === 0) throw new Error("Giỏ hàng trống!");

    let totalPrice = 0;
    const orderDetails: OrderDetail[] = [];

    // ✅ Kiểm tra tồn kho trước khi tạo đơn
    for (const item of cartItems) {
      const product = item.Products;
      if (!product) throw new Error("Sản phẩm không tồn tại");

      if ((product.Stock || 0) < item.quantity!) {
        throw new Error(`Sản phẩm "${product.ProductName}" chỉ còn ${product.Stock} trong kho.`);
      }

      const itemTotal = (product.SalePrice || 0) * item.quantity!;
      totalPrice += itemTotal;

      const detail = new OrderDetail();
      detail.Product = product;
      detail.ProductName = product.ProductName;
      detail.ProductImage = product.ImageName;
      detail.Quantity = item.quantity;
      detail.Price = product.SalePrice;
      detail.TotalPrice = itemTotal;
      orderDetails.push(detail);
    }

    // 🧾 Tạo đơn hàng chính
    const order = new Order();
    order.CustomerName = CustomerName;
    order.PhoneNumber = PhoneNumber;
    order.Address = Address;
    order.Notes = Notes;
    order.TotalPrice = totalPrice;
    order.PaymentMethod = PaymentMethod;
    order.Status = 2; // 2 = Chờ xử lý (COD)
    order.User = user;
    await OrderRepository.save(order);

    // 💾 Lưu chi tiết đơn hàng
    for (const detail of orderDetails) {
      detail.Order = order;
      await OrderDetailRepository.save(detail);
    }

    // 🏷️ Trừ tồn kho
    for (const item of cartItems) {
      const product = item.Products;
      if (product) {
        product.Stock = (product.Stock || 0) - item.quantity!;
        await ProductRepository.save(product);
      }
    }

    // 🧹 Xóa giỏ hàng
    await CartRepository.delete({ User: { idUser: user.idUser } });

    return order;
  }

  /** 💳 Tạo đơn hàng sau khi thanh toán MOMO thành công */
  static async createFromMomo(extraData: any, momoOrderId: string) {
    try {
      const { CustomerName, PhoneNumber, Address, Notes, userId, cartItems } = extraData;

      if (!userId) throw new Error("Thiếu userId trong extraData");
      if (!cartItems || cartItems.length === 0)
        throw new Error("Giỏ hàng trống trong extraData");

      const user = await UserRepository.findOne({
        where: { idUser: Number(userId) },
      });
      if (!user) throw new Error("User không tồn tại");

      let totalPrice = 0;
      const orderDetails: OrderDetail[] = [];

      // ✅ Kiểm tra tồn kho trước
      for (const item of cartItems) {
        const product = await ProductRepository.findOne({
          where: { idProduct: item.productId },
        });
        if (!product) throw new Error(`Sản phẩm ID ${item.productId} không tồn tại`);

        if ((product.Stock || 0) < item.quantity) {
          throw new Error(`Sản phẩm "${product.ProductName}" chỉ còn ${product.Stock} trong kho.`);
        }

        const itemTotal = (product.SalePrice || 0) * item.quantity;
        totalPrice += itemTotal;

        const detail = new OrderDetail();
        detail.Product = product;
        detail.ProductName = product.ProductName;
        detail.ProductImage = product.ImageName;
        detail.Quantity = item.quantity;
        detail.Price = product.SalePrice;
        detail.TotalPrice = itemTotal;
        orderDetails.push(detail);
      }

      // 🧾 Tạo đơn hàng MOMO
      const order = new Order();
      order.CustomerName = CustomerName;
      order.PhoneNumber = PhoneNumber;
      order.Address = Address;
      order.Notes = Notes;
      order.TotalPrice = totalPrice;
      order.PaymentMethod = "1"; // 1 = MOMO
      order.Status = 1; // Đã thanh toán
      order.User = user;
      order.MomoOrderId = momoOrderId;
      await OrderRepository.save(order);

      // 💾 Lưu chi tiết
      for (const detail of orderDetails) {
        detail.Order = order;
        await OrderDetailRepository.save(detail);
      }

      // 🏷️ Cập nhật tồn kho
      for (const item of cartItems) {
        const product = await ProductRepository.findOne({
          where: { idProduct: item.productId },
        });
        if (product) {
          product.Stock = (product.Stock || 0) - item.quantity;
          await ProductRepository.save(product);
        }
      }

      // 🧹 Xóa giỏ hàng
      await CartRepository.delete({ User: { idUser: user.idUser } });

      console.log("✅ Đơn hàng MOMO đã được tạo và tồn kho đã cập nhật");
      return order;
    } catch (error) {
      console.error("❌ [Momo] Lỗi tạo đơn hàng:", error);
      throw error;
    }
  }

  /** 📦 Lấy đơn hàng theo momoOrderId */
  static async getOrderByMomoId(orderId: string) {
    const order = await OrderRepository.findOne({
      where: { MomoOrderId: orderId },
      relations: ["User", "OrderDetail"],
    });

    if (!order) return null;

    return {
      success: true,
      status: order.Status,
      total: order.TotalPrice,
      paymentMethod: order.PaymentMethod,
      customer: order.CustomerName,
    };
  }
}

export default OrderService;
