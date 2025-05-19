import { Request, Response, NextFunction } from "express";

export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.userIdLogin) {
        // Nếu người dùng chưa đăng nhập, trả về phản hồi lỗi
        res.status(401).json({
            message: "Bạn chưa đăng nhập, vui lòng đăng nhập để tiếp tục!",
            redirect: "http://localhost:3000/auth/signin"
        });
    } else {
        // Nếu người dùng đã đăng nhập, tiếp tục xử lý yêu cầu
        next();
    }
};
