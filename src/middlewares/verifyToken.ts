import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";

dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

// Mở rộng interface Request trong Express
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  // Lấy token từ cookie
  const token = req.cookies.token;

  // Nếu không có token thì trả về lỗi 403
  if (!token) {
    res.status(403).json({ message: "No token provided" });
    return;
  }

  try {
    // Xác thực và giải mã token
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.user = decoded;

    // Tiếp tục thực hiện middleware tiếp theo
    next();
  } catch (err) {
    // Token không hợp lệ
    res.status(401).json({ message: "Invalid token" });
  }
};
