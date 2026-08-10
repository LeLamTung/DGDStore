import { AppDataSource } from '@databases/data-source';
import { Request, Response } from "express";
import Users from "@entities/Users"; // 👈 Import Entity User

// Khởi tạo Repository (nếu bạn chưa export sẵn ở file khác)
const UserRepository = AppDataSource.getRepository(Users);

class UserController {
  static async getProfile(req: Request, res: Response) {
    try {
      // 1️⃣ Lấy user từ req (đã được middleware verifyToken gắn vào)
      // Ép kiểu (as any) hoặc tạo interface riêng để tránh lỗi TS
      const currentUser = req.user as { userId: number; email: string; role: string };

      if (!currentUser || !currentUser.userId) {
        return res.status(401).json({ message: "Không xác định được người dùng từ Token" });
      }

      // 2️⃣ Truy vấn Database
      const user = await UserRepository.findOne({
        where: { idUser: currentUser.userId },
        // Chỉ chọn các trường an toàn để trả về client
        select: {
            idUser: true,
            UserName: true,
            Email: true,
            // Không select Password ở đây
        }
      });

      if (!user) {
        return res.status(404).json({ message: "Người dùng không tồn tại" });
      }

      // 3️⃣ Trả về kết quả
      return res.status(200).json({ 
        message: "Lấy thông tin thành công",
        data: user 
      });

    } catch (error) {
      console.error("Lỗi GetProfile:", error);
      return res.status(500).json({ message: "Lỗi Server khi lấy thông tin cá nhân" });
    }
  }
}

export default UserController;