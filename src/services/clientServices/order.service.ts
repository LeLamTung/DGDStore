import { AppDataSource } from "@databases/data-source";
import Order from "@entities/Order";
import OrderDetail from "@entities/OrderDetail";
import Products from "@entities/Products";
import { Request } from "express";

const OrderRepository = AppDataSource.getRepository(Order);
const OrderDetailRepository = AppDataSource.getRepository(OrderDetail);
const ProductRepository = AppDataSource.getRepository(Products);

class OrderService {
  static async createOrder(req: Request) {
    const { CustomerName, PhoneNumber, Address, Notes, PaymentMethod } =
      req.body;
    const cart = req.session.cart;
    if (!cart || cart.length === 0) {
      console.warn("🛒 Giỏ hàng trống!");
      throw new Error("Giỏ hàng trống!");
    }

    let totalPrice = 0;
    const orderDetails: OrderDetail[] = [];

    for (let item of cart) {
      const product = await ProductRepository.findOne({
        where: { idProduct: item.productId },
      });
      if (!product || product.SalePrice === undefined) {
        throw new Error(
          `Sản phẩm ID ${item.productId} không tồn tại hoặc thiếu giá!`
        );
      }

      const itemTotal = product.SalePrice * item.quantity;
      totalPrice += itemTotal;

      const orderDetail = new OrderDetail();
      orderDetail.Product = product;
      orderDetail.ProductName = product.ProductName;
      orderDetail.ProductImage = product.ImageName;
      orderDetail.Quantity = item.quantity;
      orderDetail.Price = product.SalePrice;
      orderDetail.TotalPrice = itemTotal;
      orderDetails.push(orderDetail);
    }

    const order = new Order();
    order.CustomerName = CustomerName;
    order.PhoneNumber = PhoneNumber;
    order.Address = Address;
    order.Notes = Notes;
    order.TotalPrice = totalPrice;
    order.PaymentMethod = PaymentMethod;
    order.Status = 2;

    await OrderRepository.save(order);

    for (let detail of orderDetails) {
      detail.Order = order;
      await OrderDetailRepository.save(detail);
    }

    req.session.cart = [];
    return order;
  }

  static async createFromMomo(data: any) {
    try {
      const extraData = data.extraData
        ? JSON.parse(Buffer.from(data.extraData, "base64").toString("utf8"))
        : null;
      if (!extraData) throw new Error("Không tìm thấy extraData");

      const { CustomerName, PhoneNumber, Address, Notes, cart } = extraData;
      let totalPrice = 0;
      const orderDetails: OrderDetail[] = [];

      for (let item of cart) {
        const product = await ProductRepository.findOne({
          where: { idProduct: item.productId },
        });
        if (!product || product.SalePrice === undefined) {
          throw new Error(
            `Sản phẩm ID ${item.productId} không tồn tại hoặc thiếu giá!`
          );
        }

        const price = product.SalePrice;
        const quantity = item.quantity;
        if (quantity !== undefined) {
          const itemTotalPrice = price * quantity;
          totalPrice += itemTotalPrice;
          const orderDetail = new OrderDetail();
          orderDetail.Product = product;
          orderDetail.ProductName = product.ProductName;
          orderDetail.ProductImage = product.ImageName;
          orderDetail.Quantity = quantity;
          orderDetail.Price = price;
          orderDetail.TotalPrice = itemTotalPrice;
          orderDetails.push(orderDetail);
        }
      }

      const order = new Order();
      order.CustomerName = CustomerName;
      order.PhoneNumber = PhoneNumber;
      order.Address = Address;
      order.Notes = Notes;
      order.TotalPrice = totalPrice;
      order.PaymentMethod = "1";
      order.Status = 1;

      await OrderRepository.save(order);
      for (let detail of orderDetails) {
        detail.Order = order;
        await OrderDetailRepository.save(detail);
      }
      //  XÓA SESSION GIỎ HÀNG
      const req = (data as any).req;
      if (req?.session) {
        req.session.cart = [];
        console.log(" Session giỏ hàng đã được xóa sau khi thanh toán Momo");
      }
      return order;
      
    } catch (error) {
      console.error(" [Momo] Lỗi tạo đơn hàng từ Momo:", error);
      throw error;
    }
  }
}

export default OrderService;
