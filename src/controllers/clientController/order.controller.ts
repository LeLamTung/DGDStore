import { Request, Response } from "express";
import OrderService from "@services/clientServices/order.service";
import axios from "axios";
import crypto from "crypto";
import { AppDataSource } from "@databases/data-source";
import Products from "@entities/Products";

class OrderController {
  static async createOrder(req: Request, res: Response) {
    try {
      const { PaymentMethod } = req.body;

      if (PaymentMethod === '0') {  
        const order = await OrderService.createOrder(req);
  
        return res.status(201).json({ message: "Order created successfully", data: order });
      } else if (PaymentMethod === '1') {  
        const accessKey = process.env.MOMO_ACCESS_KEY || "";
        const secretKey = process.env.MOMO_SECRET_KEY || "";
        const partnerCode = process.env.MOMO_PARTNER_CODE || "MOMO";
        const orderId = partnerCode + new Date().getTime();
        const redirectUrl = `${process.env.MOMO_RETURN_URL || "http://localhost:3001/payment-success"}?orderId=${orderId}`;
        const ipnUrl = process.env.MOMO_NOTIFY_URL || "http://localhost:3001/api/client/order/momo-ipn";
  
        const requestType = "payWithMethod";
        const requestId = orderId;
        const orderInfo = "Thanh toan don hang qua Momo";
  
        const extraDataObject = {
          CustomerName: req.body.CustomerName,
          PhoneNumber: req.body.PhoneNumber,
          Address: req.body.Address,
          Notes: req.body.Notes,
          cart: req.session.cart || [],
        };
  
  
        const extraData = Buffer.from(JSON.stringify(extraDataObject)).toString("base64");
        let total = 0;
        for (let item of req.session.cart || []) {
          const product = await AppDataSource.getRepository(Products).findOneBy({ idProduct: item.productId });
          if (product && product.SalePrice !== undefined) {
            const itemTotal = product.SalePrice * item.quantity;
            total += itemTotal;
          } else {
            console.warn(` Không tìm thấy sản phẩm ID ${item.productId}`);
          }
        }
  
        console.log("💲 [Checkout] Tổng tiền gửi Momo:", total);
  
        const rawSignature =
          `accessKey=${accessKey}&amount=${total}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
          `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}` +
          `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  
        const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");
  
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
    
        const result = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", requestBody);  
        return res.status(200).json({ payUrl: result.data.payUrl });
      } else {
        return res.status(400).json({ message: "PaymentMethod không hợp lệ" });
      }
    } catch (err: any) {
      res.status(500).json({ message: "Lỗi tạo đơn hàng", error: err?.message });
    }
  }

  static async momoIPN(req: Request, res: Response) {
    try {
      const { resultCode } = req.body;
      if (resultCode === 0 || resultCode === '0') {
        console.log("[IPN] Thanh toán thành công, tạo đơn hàng...");
        await OrderService.createFromMomo(req.body);
      } else {
        console.warn("[IPN] resultCode không phải 0:", resultCode);
      }
  
      return res.status(200).json({ message: "IPN received" });
    } catch (err) {
      console.error("[IPN] Lỗi khi xử lý callback:", err);
      return res.status(500).json({ message: "IPN xử lý lỗi" });
    }
  }  
};

export default OrderController;

