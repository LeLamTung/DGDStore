import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });

class AiService {
  // Thêm tham số priceHistory (mảng các object lịch sử giá)
  static async suggestPrice(data: any, priceHistory: any[] = []) {
    try {
      const { ProductName, OriginalPrice, Description, CategoryName } = data;

      // 1. Xử lý lịch sử giá thành chuỗi văn bản để AI đọc
      // Chỉ lấy khoảng 5-10 lần thay đổi gần nhất để tiết kiệm token và tập trung vào hiện tại
      const recentHistory = priceHistory.slice(0, 10); 
      
      const historyText = recentHistory.length > 0 
        ? recentHistory.map((h: any) => {
            const date = new Date(h.ChangedAt).toLocaleDateString("vi-VN");
            return `- Ngày ${date}: Giá gốc ${h.OriginalPrice} -> Giá bán ${h.SalePrice} (${h.Reason || "Không rõ lý do"})`;
          }).join("\n")
        : "Chưa có lịch sử giá (Sản phẩm mới).";

      // 2. Viết lại Prompt chi tiết hơn
      const prompt = `
        Bạn là Chuyên gia Định giá tại một chuỗi siêu thị điện máy lớn ở Việt Nam (như Điện Máy Xanh, MediaMart).
        Sản phẩm cần định giá thuộc nhóm: ĐIỆN GIA DỤNG (Tủ lạnh, Máy giặt, Điều hòa, TV...).

        DỮ LIỆU ĐẦU VÀO:
        - Tên Model: ${ProductName}
        - Danh mục: ${CategoryName}
        - Giá niêm yết hãng (Original Price): ${Number(OriginalPrice)} VNĐ
        - Mô tả: "${Description}"
        - Lịch sử giá cũ: \n${historyText}

        NHIỆM VỤ CỦA BẠN (TƯ DUY NHƯ CON NGƯỜI):
        Bước 1: Xác định "Giá thị trường trung bình" (Market Price).
           - Với đồ điện máy, giá bán thực tế tại các đại lý thường rẻ hơn giá niêm yết của hãng từ 15% đến 30% do cạnh tranh khốc liệt.
           - Hãy phân tích tên model sản phẩm để ước lượng mức giá mà các đối thủ thường bán.
        
        Bước 2: Đề xuất "Giá Bán (Sale Price)".
           - Mục tiêu: Giá phải TỐT HƠN hoặc BẰNG giá thị trường trung bình để cạnh tranh.
           - Nếu là hàng trưng bày/xả kho (dựa vào mô tả): Giảm sâu thêm.
           - Nếu sản phẩm chưa có lịch sử giá: Đừng giảm rón rén 5%.

        RÀNG BUỘC KỸ THUẬT:
        - suggestedPrice < ${Number(OriginalPrice)}
        - suggestedPrice phải làm tròn đẹp (ví dụ: 9.590.000 thay vì 9.591.234).

        OUTPUT JSON (Bắt buộc):
        {
            "suggestedPrice": number,
            "discountPercentage": number,
            "marketPriceEstimate": number, 
            "reason": "String (Giải thích ngắn gọn trong khoảng 50 từ)."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }]
            }
        ],
        config: {
            responseMimeType: "application/json",
        },
      });
      // Lấy text an toàn
      const resultText = response.text;
      if (!resultText) throw new Error("AI không trả về kết quả.");

      return JSON.parse(resultText);

    } catch (error) {
      console.error("Lỗi AI Service:", error);
      // Fallback khi lỗi
      return {
          suggestedPrice: data.OriginalPrice,
          discountPercentage: 0,
          reason: "Hệ thống bận, giữ nguyên giá gốc."
      };
    }
  }
}

export default AiService;