import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

// Mở rộng interface Request (Giữ nguyên)
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  let token = null;

  // 1️⃣ ƯU TIÊN CAO NHẤT: Lấy token từ Header "Authorization"
  // Frontend gửi dạng: "Bearer eyJhbGc..." -> Cần cắt chữ "Bearer " đi
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2️⃣ DỰ PHÒNG: Nếu Header không có, mới tìm trong Cookie
  // (Dành cho trường hợp test postman hoặc domain cùng cấp)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3️⃣ Kiểm tra kết quả
  if (!token) {
    // Quan trọng: Log ra để debug xem server nhận được gì (xem xong xóa đi)
    console.log("Header nhận được:", req.headers.authorization);
    console.log("Cookie nhận được:", req.cookies);
    
    res.status(401).json({ message: "Bạn chưa đăng nhập (Không tìm thấy Token)" });
    return;
  }

  try {
    // Xác thực và giải mã token
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.user = decoded;

    // Token hợp lệ -> Cho qua
    next();
  } catch (err) {
    console.error("Lỗi verify token:", err);
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};