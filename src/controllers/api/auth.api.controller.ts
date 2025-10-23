import User from "@entities/Users";
import UserService from "@services/user.service";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AppDataSource } from "@databases/data-source";
import { OAuth2Client } from "google-auth-library";
import Role from "@entities/Role";

const roleRepository = AppDataSource.getRepository(Role);
const userRepository = AppDataSource.getRepository(User);
const client_id = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(client_id);
dotenv.config();
const SECRET_KEY = process.env.SECRET_KEY || "default_secret_key";

class AuthApiController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const Users: User[] = await UserService.getAllUsers();
      const data = {
        cod: 200,
        data: Users,
      };
      res.json(data);
    } catch (error) {
      const data = {
        cod: 500,
        message: "Server error",
      };
      res.json(data);
    }
  }
  static async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);

      if (isNaN(id)) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: "User không tồn tại" });
      }

      res.json({
        cod: 200,
        message: "Lấy dữ liệu thành công",
        data: {
          idUser: user.idUser,
          UserName: user.UserName,
          email: user.Email,
          isActive: user.IsActive,
        },
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      res.status(500).json({ message: "Lỗi server" });
    }
  }

  static async register(req: Request, res: Response) {
    try {
      const User = await UserService.createUser(req.body);
      // //create cookies
      // res.cookie('email', req.body.Email, { maxAge: 900000, httpOnly: true });
      return res.status(201).json({
        cod: 201,
        message: "Tạo tài khoản thành công",
        data: User,
      });
    } catch (error: any) {
      console.error("Lỗi khi tạo tài khoản:", error);

      if (error?.code === "ER_DUP_ENTRY" || error?.code === "23505") {
        return res.status(400).json({
          cod: 400,
          message: "Email đã tồn tại, vui lòng nhập email khác.",
        });
      }
    }

    return res.status(500).json({
      cod: 500,
      message: "Lỗi server, vui lòng thử lại sau.",
    });
  }

  static async login(req: Request, res: Response) {
    try {
      const user: any = await UserService.getAccountbyEmailandPassword(
        req.body
      );
      if (!user) {
        return res.status(401).json({
          message: "Invalid email or password",
          redirect: "/auth/signin",
        });
      }
      if (!user.IsActive) {
        return res.status(403).json({
          message:
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
        });
      }

      // req.session.regenerate((err: any) => {
      //   if (err) {
      //     console.error("Session regeneration error:", err);
      //     return res.status(500).json({ message: "Internal Server Error" });
      //   }

      //   req.session.userIdLogin = user.idUser;
      //   req.session.userLogin = user;

      //   req.session.save((err: any) => {
      //     if (err) {
      //       console.error("Session save error:", err);
      //       return res.status(500).json({ message: "Session save error" });
      //     }

      //     console.log("Session after setting user:", req.session);

      // Tạo JWT token
      const token = jwt.sign(
        {
          userId: user.idUser,
          email: user.Email,
          role: user.Role?.NameRole,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      // Gửi token qua cookie
      res.cookie("token", token, {
        httpOnly: true, // Đảm bảo cookie không thể truy cập từ JavaScript
        maxAge: 3600000, // Cookie hết hạn sau 1 giờ
        sameSite: "lax", // Giúp bảo vệ chống lại CSRF
      });
      const redirect =
        user.Role?.NameRole === "Admin" 
          ? "http://localhost:3000/app/dashboard/default"
          : "http://localhost:3001";

      return res.json({
        message: "Login successful",
        redirect,
        user: {
          idUser: user.idUser,
          UserName: user.UserName,
          Email: user.Email,
          Role: user.Role,
          IsActive: user.IsActive,
        },
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Error logging in user" });
    }
  }
  static async loginWithGoogle(req: Request, res: Response) {
    try {
      const user: any = await UserService.loginGoogle(req.body);
      if (!user) {
        return res.status(401).json({ message: "Google login failed" });
      }

      if (!user.IsActive) {
        return res.status(403).json({
          message:
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
        });
      }
      const token = jwt.sign(
        {
          userId: user.idUser,
          email: user.Email,
          role: user.Role?.NameRole,
        },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "lax",
      });

      return res.json({
        message: "Google Login successful",
        user: {
          idUser: user.idUser,
          Email: user.Email,
          Role: user.Role,
          IsActive: user.IsActive,
        },
      });
    } catch (err) {
      console.error("Google login error:", err);
      return res.status(500).json({ message: "Google login failed" });
    }
  }

  static logout(req: any, res: Response) {
    res.clearCookie("token"); // Xóa token trong cookie

    res.status(200).json({ message: "Logout successful" });
  }
}
export default AuthApiController;
