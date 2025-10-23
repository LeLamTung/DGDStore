import { NextFunction, Request, Response } from "express";

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const role = (req.user as any)?.role;
    console.log(role);
    if (role ==="Admin"){
        return next();
    }
    res.status(403).json({ message: "Bạn không có quyền truy cập Web này" });
};
