import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

class GHNService {
  /** 🚚 Tạo đơn hàng bên GHN */
  static async createShippingOrder(orderData: any, items: any[]) {
    const GHN_API_URL = process.env.GHN_API_URL;
    const GHN_SHOP_ID = Number(process.env.GHN_SHOP_ID);
    const GHN_TOKEN = process.env.GHN_TOKEN;
    if (!GHN_API_URL || !GHN_TOKEN) {
      throw new Error("Chưa cấu hình GHN trong file .env");
    }
    try {
      // Map item của bạn sang item của GHN
      const ghnItems = items.map((item) => {
        
        const rawWeight = item.Weight || item.Product?.Weight || 2000;
        
        return {
          name: item.ProductName || "Sản phẩm",
          code: String(item.Product?.idProduct || ""),
          
          
          quantity: Number(item.Quantity || 1), 
          price: Number(item.Price || 0),
          weight: Math.floor(Number(rawWeight)), // GHN thích số nguyên (Int), dùng Math.floor cho chắc
        };
      });
      const totalOrderWeight = ghnItems.reduce((total, item) => {
          return total + (item.weight * item.quantity);
      }, 0);
      // Tính tiền thu hộ (COD)
      // Nếu thanh toán COD thì thu đủ tiền, nếu MOMO thì thu 0đ
      const codAmount =
        orderData.PaymentMethod === "COD" ? Number(orderData.TotalPrice) : 0;

      const payload = {
        payment_type_id: 1, // 1: Người bán trả ship, 2: Người mua trả
        note: orderData.Notes || "Cho xem hàng",
        required_note: "KHONGCHOXEMHANG", // Hoặc "CHOXEMHANGKHONGTHU"
        to_name: orderData.CustomerName,
        to_phone: orderData.PhoneNumber,
        to_address: orderData.Address, // Địa chỉ chi tiết
        to_ward_code: orderData.WardCode, // BẮT BUỘC
        to_district_id: Number(orderData.DistrictID), // BẮT BUỘC
        cod_amount: codAmount,
        content: orderData.Notes,
        weight: Number(totalOrderWeight), // Tổng cân nặng
        service_type_id: 2, // 2: Chuẩn, 5: Hàng lớn... (Tùy shop cấu hình)
        items: ghnItems,
      };

      const response = await axios.post(
        `${GHN_API_URL}/shipping-order/create`,
        payload,
        {
          headers: {
            Token: GHN_TOKEN,
            ShopId: GHN_SHOP_ID,
            "Content-Type": "application/json",
          },
        },
      );

      return response.data.data.order_code; // Trả về mã vận đơn (VD: L8CC20)
    } catch (error: any) {
      console.error("❌ Lỗi GHN:", error.response?.data || error.message);
      // Không throw error để tránh rollback đơn hàng trong DB
      // Admin sẽ vào dashboard đẩy lại sau nếu lỗi
      return null;
    }
  }
  static async getOrderDetail(orderCode: string) {
    const API_URL = process.env.GHN_API_URL;
    const TOKEN = process.env.GHN_TOKEN;
    
    try {
      const res = await axios.post(
        `${API_URL}/shipping-order/detail`,
        { order_code: orderCode },
        { headers: { token: TOKEN } }
      );
      
      return res.data.data; // Trả về toàn bộ thông tin đơn hàng
    } catch (error) {
      console.error("Lỗi lấy chi tiết GHN:", error);
      return null;
    }
  }
}

export default GHNService;
