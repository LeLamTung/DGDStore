import { AppDataSource } from "@databases/data-source";
import Order from "@entities/Orders";
import OrderDetail from "@entities/OrderDetail";
import Products from "@entities/Products";
import Cart from "@entities/Cart";
import Users from "@entities/Users";
import GHNService from "@services/ghn.service";
import axios from "axios";
import { MoreThan } from "typeorm"; // 👈 Import thêm MoreThan để lọc ngày

const OrderRepository = AppDataSource.getRepository(Order);
const OrderDetailRepository = AppDataSource.getRepository(OrderDetail);
const ProductRepository = AppDataSource.getRepository(Products);
const CartRepository = AppDataSource.getRepository(Cart);
const UserRepository = AppDataSource.getRepository(Users);

class OrderService {
  static async getMyOrders(userId: number) {
    const orders = await OrderRepository.find({
      where: { User: { idUser: userId } },
      order: { CreatedAt: "DESC" },
      relations: ["OrderDetail"],
      take: 20,
      skip: 0
    });
    return orders;
  }

  /** 🧾 Tạo đơn hàng thanh toán COD */
  static async createOrder(userId: number, data: any) {
    const { CustomerName, PhoneNumber, Address, Notes, PaymentMethod, DistrictID, WardCode, ShippingFee } = data;

    if (!userId) throw new Error("User not authenticated");

    const user = await UserRepository.findOne({ where: { idUser: userId } });
    if (!user) throw new Error("User not found");

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

      if ((product.Stock || 0) < item.Quantity!) {
        throw new Error(`Sản phẩm "${product.ProductName}" chỉ còn ${product.Stock} trong kho.`);
      }

      const itemTotal = (product.SalePrice || 0) * item.Quantity!;
      totalPrice += itemTotal;

      const detail = new OrderDetail();
      detail.Product = product;
      detail.ProductName = product.ProductName;
      detail.ProductImage = product.ImageName;
      detail.Quantity = item.Quantity;
      detail.Price = product.SalePrice;
      detail.TotalPrice = itemTotal;
      orderDetails.push(detail);
    }

    //  Tạo đơn hàng chính
    const order = new Order();
    order.CustomerName = CustomerName;
    order.PhoneNumber = PhoneNumber;
    order.Address = Address;
    order.DistrictId = Number(DistrictID);
    order.WardCode = String(WardCode);
    order.Notes = Notes;
    order.TotalPrice = totalPrice;
    order.PaymentMethod = PaymentMethod;
    order.OrderStatus = 1; // 1 = Pending
    order.PaymentStatus = 0; // 0 = Unpaid
    order.ShippingFee = Number(ShippingFee || 0);
    order.User = user;

    await OrderRepository.save(order);

    for (const detail of orderDetails) {
      detail.Order = order;
      await OrderDetailRepository.save(detail);
    }

    //  GỌI GHN: Đẩy đơn sang Giao Hàng Nhanh
    if (DistrictID && WardCode) {
      console.log("⏳ Đang đẩy đơn sang GHN...");
      try {
        const ghnCode = await GHNService.createShippingOrder(order, orderDetails);
        if (ghnCode) {
          order.GhnOrderCode = ghnCode;
          order.OrderStatus = 3; // Đã gửi vận chuyển
          await OrderRepository.save(order);
          console.log(`✅ Tạo đơn GHN thành công: ${ghnCode}`);
        }
      } catch (error: any) {
        console.error("⚠️ Lỗi tạo đơn GHN (đơn hàng vẫn được tạo trong DB):", error.message);
        // Không throw lỗi ở đây để đơn hàng vẫn thành công trong hệ thống nội bộ
      }
    }

    //  Trừ tồn kho
    for (const item of cartItems) {
      const product = item.Products;
      if (product) {
        product.Stock = (product.Stock || 0) - item.Quantity!;
        await ProductRepository.save(product);
      }
    }

    await CartRepository.delete({ User: { idUser: user.idUser } });

    return order;
  }

  /** Tạo đơn hàng sau khi thanh toán MOMO thành công */
  static async createFromMomo(extraData: any, momoOrderId: string) {
    const { CustomerName, PhoneNumber, Address, Notes, PaymentMethod, userId, cartItems, DistrictID, WardCode, ShippingFee } = extraData;

    if (!userId) throw new Error("Thiếu userId trong extraData");
    if (!cartItems || cartItems.length === 0)
      throw new Error("Giỏ hàng trống trong extraData");

    const user = await UserRepository.findOne({
      where: { idUser: Number(userId) },
    });
    if (!user) throw new Error("User không tồn tại");

    let totalPrice = 0;
    const orderDetails: OrderDetail[] = [];

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

    const order = new Order();
    order.CustomerName = CustomerName;
    order.PhoneNumber = PhoneNumber;
    order.Address = Address;
    order.DistrictId = Number(DistrictID);
    order.WardCode = String(WardCode);
    order.Notes = Notes;
    order.ShippingFee = Number(ShippingFee || 0);
    order.TotalPrice = totalPrice + order.ShippingFee;
    order.PaymentMethod = PaymentMethod || "1";
    order.OrderStatus = 1;
    order.PaymentStatus = 1;
    order.User = user;
    order.MomoOrderId = momoOrderId;
    
    await OrderRepository.save(order);

    for (const detail of orderDetails) {
      detail.Order = order;
      await OrderDetailRepository.save(detail);
    }

    //  GỌI GHN
    if (order.DistrictId && order.WardCode) {
      try {
        const ghnCode = await GHNService.createShippingOrder(order, orderDetails);
        if (ghnCode) {
          order.GhnOrderCode = ghnCode;
          await OrderRepository.save(order);
        }
      } catch (error: any) {
        console.error("⚠️ Lỗi GHN (Momo Order):", error.message);
      }
    }

    for (const item of cartItems) {
      const product = await ProductRepository.findOne({
        where: { idProduct: item.productId },
      });
      if (product) {
        product.Stock = (product.Stock || 0) - item.quantity;
        await ProductRepository.save(product);
      }
    }

    await CartRepository.delete({ User: { idUser: user.idUser } });

    console.log(" Đơn hàng MOMO đã được tạo và tồn kho đã cập nhật");
    return order;
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
      paymentstatus: order.PaymentStatus,
      orderstatus: order.OrderStatus,
      total: order.TotalPrice,
      paymentMethod: order.PaymentMethod,
      customer: order.CustomerName,
    };
  }

  static async retryCreateGhnOrder(orderId: number) {
    const order = await OrderRepository.findOne({
      where: { idOrder: orderId },
      relations: ["OrderDetail", "OrderDetail.Product"]
    });

    if (!order) throw new Error("Đơn hàng không tồn tại");
    if (order.GhnOrderCode) return order.GhnOrderCode;

    const itemsForGhn = order.OrderDetail!.map(detail => ({
      ProductName: detail.ProductName,
      Quantity: detail.Quantity,
      Price: detail.Price,
      Weight: detail.Product?.Weight || 200,
      Product: detail.Product
    }));
    if (itemsForGhn.length === 0) throw new Error("Đơn hàng không có sản phẩm");

    const ghnCode = await GHNService.createShippingOrder(order, itemsForGhn);

    if (ghnCode) {
      order.GhnOrderCode = ghnCode;
      order.OrderStatus = 3;
      await OrderRepository.save(order);
      return ghnCode;
    } else {
      throw new Error("GHN trả về null");
    }
  }

  // 🔄 ĐỒNG BỘ TRẠNG THÁI & TỰ ĐỘNG THỬ LẠI (ĐÃ SỬA LOGIC)
  static async syncGhnStatus(orderId: number) {
    const order = await OrderRepository.findOne({
      where: { idOrder: orderId },
      relations: ["OrderDetail", "OrderDetail.Product"]
    });

    if (!order) return null;

    // 1. Nếu đã có mã GHN -> Chỉ cập nhật trạng thái
    if (order.GhnOrderCode) {
      try {
        const ghnInfo = await GHNService.getOrderDetail(order.GhnOrderCode);
        if (!ghnInfo) return order;

        let newStatus = order.OrderStatus;
        const ghnStatus = ghnInfo.status;

        switch (ghnStatus) {
          case 'cancel': newStatus = 5; break;
          case 'delivered':
            newStatus = 4;
            order.PaymentStatus = 1;
            break;
          case 'picking':
          case 'delivering': newStatus = 3; break;
          case 'returned': newStatus = 5; break;
        }

        if (newStatus !== order.OrderStatus) {
          order.OrderStatus = newStatus;
          await OrderRepository.save(order);
        }
        return order;
      } catch (error) {
        console.error(`Lỗi sync status đơn ${order.GhnOrderCode}:`, error);
        return order;
      }
    }

    // 2. Nếu CHƯA có mã GHN (Auto-retry)
    // 👇 FIX: Chỉ thử lại với đơn hàng MỚI TẠO trong vòng 24h qua
    const TWENTY_FOUR_HOURS_AGO = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    // Logic: Chưa có mã GHN + Trạng thái chờ + Đơn mới tạo gần đây
    if (!order.GhnOrderCode && order.OrderStatus === 1 && order.CreatedAt && order.CreatedAt > TWENTY_FOUR_HOURS_AGO) {
      if (order.DistrictId && order.WardCode) {
        console.log(`🛠 Auto-retry: Đang thử đẩy lại đơn #${orderId} sang GHN...`);

        try {
          const ghnCode = await this.retryCreateGhnOrder(orderId);
          console.log(`✅ Tự động sửa lỗi thành công: ${ghnCode}`);
          order.GhnOrderCode = ghnCode;
          order.OrderStatus = 3;
        } catch (err: any) {
          console.error(`❌ Tự động đẩy đơn #${orderId} thất bại:`, err.message);
          // Không throw error để tránh vòng lặp crash server
        }
      }
    } else {
        // Log nhẹ để biết là bỏ qua đơn cũ
        // console.log(`⏩ Bỏ qua sync đơn cũ #${orderId} (Quá 24h hoặc thiếu thông tin)`);
    }

    return order;
  }

  static async calculateFee(districId: number, wardCode: string, weight: number) {
    const GHN_URL_SERVICE = "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services";
    const GHN_URL_FEE = "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";

    const TOKEN = process.env.GHN_TOKEN;
    const SHOP_ID = Number(process.env.GHN_SHOP_ID);
    const SHOP_DISTRICT = Number(process.env.SHOP_DISTRICT_ID);
    try {

      // 1. Lấy gói dịch vụ
      const servicePayload = {
        shop_id: SHOP_ID,
        from_district: SHOP_DISTRICT,
        to_district: districId,
        weight: weight,
      };

      const serviceRes = await axios.post(
        GHN_URL_SERVICE,
        servicePayload,
        {
          headers: {
            token: TOKEN,
            ShopId: String(SHOP_ID) 
          }
        }
      );

      if (!serviceRes.data.data || serviceRes.data.data.length === 0) {
        throw new Error("Không tìm thấy dịch vụ vận chuyển");
      }
      const serviceId = serviceRes.data.data[0].service_id;
      // console.log("Service ID tìm thấy:", serviceId);

      // 2. Tính phí
      const feeRes = await axios.post(
        GHN_URL_FEE,
        {
          service_id: serviceId,
          service_type_id: 2,
          insurance_value: 0,
          coupon: null,
          from_district_id: SHOP_DISTRICT,
          to_district_id: districId,
          to_ward_code: wardCode,
          height: 15, length: 15, width: 15,
          weight: weight,
        },
        {
          headers: {
            token: TOKEN,
            ShopId: String(SHOP_ID)
          }
        }
      );

      console.log("Phí ship:", feeRes.data.data.total);
      return feeRes.data.data.total;

    } catch (error: any) {
      console.error("LỖI GHN CHI TIẾT:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Lỗi tính phí GHN");
    }
  }
}

export default OrderService;