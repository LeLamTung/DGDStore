import { NextFunction, Request, Response } from "express";

export const isAdmin = (req: any, res: Response, next: NextFunction) => {
    const { userLogin } = req.session;
    console.log("Check tai khoan:", userLogin);
    
    // Kiểm tra role
    const currentRoleName = userLogin?.Role?.NameRole;
    console.log('currentRoleName', currentRoleName);

    // Nếu là admin
    if (currentRoleName === "Admin"|| currentRoleName === "Staff") {
        next();
    } else {
        // Trả về JSON lỗi thay vì render ejs
        res.status(403).json({
            message: "Bạn không có quyền truy cập!",
            redirect: "http://localhost:3000/auth/signin"
        });
    }
};
