import { Request, Response } from "express";
import OrderService from "@services/clientServices/order.service";
import axios from "axios";
import crypto from "crypto";
import { AppDataSource } from "@databases/data-source";
import Products from "@entities/Products";
import Cart from "@entities/Cart";

const CartRepository = AppDataSource.getRepository(Cart);

class OrderController {
  /** 🧾 Tạo đơn hàng COD hoặc MOMO */
  static async createOrder(req: Request, res: Response) {
    try {
      const { PaymentMethod } = req.body;
      const userId = (req.user as any)?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Bạn chưa đăng nhập!" });
      }

      if (PaymentMethod === "0") {
        // 👉 Thanh toán COD
        const order = await OrderService.createOrder(req);
        return res.status(201).json({
          message: "Đặt hàng thành công (COD)",
          data: order,
        });
      }

      if (PaymentMethod === "1") {
        // 👉 Thanh toán qua MOMO
        const accessKey = process.env.MOMO_ACCESS_KEY || "";
        const secretKey = process.env.MOMO_SECRET_KEY || "";
        const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
        const orderId = partnerCode + new Date().getTime();
        const MomoOrderId = orderId; // Sử dụng orderId làm MomoOrderId

        const redirectUrl =
          `${process.env.MOMO_RETURN_URL || "http://localhost:3001/payment-success"}?orderId=${orderId}`;
        const ipnUrl =
          process.env.MOMO_NOTIFY_URL || "";
        console.log("ipnUrl", ipnUrl);
        const requestType = "payWithMethod";
        const requestId = orderId;
        const orderInfo = "Thanh toán đơn hàng qua Momo";

        // 🛒 Lấy giỏ hàng từ DB
        const cartItems = await CartRepository.find({
          where: { User: { idUser: Number(userId) } },
          relations: ["Products"],
        });

        if (!cartItems.length) {
          return res.status(400).json({ message: "Giỏ hàng trống!" });
        }

        // 🔹 Tính tổng tiền
        let total = 0;
        const momoCartData = cartItems.map((item) => {
          const price = item.Products?.SalePrice || 0;
          const quantity = item.quantity || 0;
          total += price * quantity;
          return {
            productId: item.Products?.idProduct,
            quantity,
          };
        });
        
        // 🔹 Chuẩn bị extraData gửi kèm cho IPN
        const extraDataObject = {
          MomoOrderId,
          CustomerName: req.body.CustomerName,
          PhoneNumber: req.body.PhoneNumber,
          Address: req.body.Address,
          Notes: req.body.Notes,
          userId,
          cartItems: momoCartData,
        };

        const extraData = Buffer.from(
          JSON.stringify(extraDataObject)
        ).toString("base64");

        const rawSignature = `accessKey=${accessKey}&amount=${total}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
        const signature = crypto
          .createHmac("sha256", secretKey)
          .update(rawSignature)
          .digest("hex");
        console.log("signature", signature);
        const requestBody = {
          partnerCode,
          partnerName: "MoMo Payment",
          storeId: "MomoTestStore",
          requestId,
          amount: total,
          orderId,
          orderInfo,
          redirectUrl,
          ipnUrl,
          lang: "vi",
          requestType,
          autoCapture: true,
          extraData,
          orderGroupId: "",
          signature,
        };

        const result = await axios.post(
          "https://test-payment.momo.vn/v2/gateway/api/create",
          requestBody
        );

        return res.status(200).json({
          message: "Tạo yêu cầu thanh toán MOMO thành công",
          payUrl: result.data.payUrl,
        });
      }

      //  PaymentMethod không hợp lệ
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
    } catch (err: any) {
      console.error(" [OrderController] Lỗi tạo đơn hàng:", err);
      res.status(500).json({ message: "Lỗi tạo đơn hàng", error: err?.message });
    }
  }

  /** 💳 Callback IPN từ MOMO */
  static async momoIPN(req: Request, res: Response) {
    try {
       // ✅ Ghi log ra file để kiểm tra nếu bị lỗi IPN không vào
      const { resultCode, extraData, orderId } = req.body;

      if (resultCode === 0 || resultCode === "0") {
        console.log("[IPN] Thanh toán thành công, tiến hành tạo đơn hàng...");

        // Giải mã extraData (base64)
        const decodedData = JSON.parse(
          Buffer.from(extraData, "base64").toString("utf8")
        );
        await OrderService.createFromMomo(decodedData, orderId);
      } else {
        console.warn("[IPN]  Thanh toán thất bại, resultCode:", resultCode);
      }

      return res.status(200).json({ message: "IPN received" });
    } catch (err) {
      console.error("[IPN]  Lỗi khi xử lý callback:", err);
      return res.status(500).json({ message: "IPN xử lý lỗi" });
    }
  }
  /** 🔍 Kiểm tra trạng thái đơn hàng theo MomoOrderId */
  static async getOrderStatus(req: Request, res: Response) {
    try {
      // OrderController.getOrderStatus

      const orderId = req.params.orderId || req.query.orderId;

      if (!orderId || typeof orderId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Thiếu hoặc sai định dạng orderId",
        });
      }

      const orderData = await OrderService.getOrderByMomoId(orderId);

      if (!orderData) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đơn hàng tương ứng",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Truy vấn trạng thái đơn hàng thành công",
        data: orderData,
      });
    } catch (err: any) {
      console.error("❌ [OrderController] Lỗi khi kiểm tra đơn hàng:", err);
      return res.status(500).json({
        success: false,
        message: "Lỗi hệ thống khi kiểm tra đơn hàng",
        error: err.message,
      });
    }
  }
}

export default OrderController;
