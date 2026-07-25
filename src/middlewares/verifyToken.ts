import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

// Mở rộng interface Request (Giữ nguyên)
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload | { userId: number };
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  // 2. Lấy từ Cookie (nếu header ko có)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ message: "Bạn chưa đăng nhập" });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    
    // Gán decoded vào req.user
    req.user = decoded; 
    
    // 💡 Mẹo: Log ra xem decoded có đúng chứa userId không
    // console.log("Decoded Token:", decoded);

    next();
  } catch (err) {
    res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};