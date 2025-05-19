import Role from "@entities/Role";
import RoleService from "@services/role.service";
import { Request, Response } from "express";
class RoleApiController {
    static async getAllRoles(req: Request, res: Response) {
        try {
            const roles: Role[] = await RoleService.getAllRoles();
            const data = {
                "cod": 200,
                "data": roles,
            }
            res.json(data);
        }
        catch (error) {
            const data = {
                "cod": 500,
                "message": "Server error",
            }
            res.json(data);
        }
    }
    static async getRoleById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id, 10);
    
            if (isNaN(id)) {
                return res.status(400).json({ message: "ID không hợp lệ" });
            }
    
            const role = await RoleService.getRoleById(id); // Thêm await
    
            if (!role) {
                return res.status(404).json({ message: "Role không tồn tại" });
            }
    
            res.json({
                cod: 200,
                message: "Lấy dữ liệu thành công",
                data: {
                    idRole: role.idRole,
                }
            });
        } catch (error) {
            console.error("Lỗi khi lấy thông tin role:", error);
            res.status(500).json({ message: "Lỗi server" });
        }
    }
    
    static async storeRole(req: Request, res:Response) {
        try {
            const Role = await RoleService.createRole(req.body);
            const data = {
                "cod": 201,
                "message": "Thêm mới thành công",
                "data": Role,
            }
            res.json(data);
        }
        catch (error) {
            const data = {
                "cod": 500,
                "message": "Server error",
            }
            res.json(data);
        }
    }
    static async updateRole(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id,10);  
            console.log("day la id:"+id);
            const role = await RoleService.updateRole(req.body);
            const data = {
                "cod": 200,
                "message": "Cập nhật thành công",
                "data": role,
            }
            res.json(data);
        }
        catch (error) {
            const data = {
                "cod": 500,
                "message": "Server error",
            }
            res.json(data);
        }
    }
    static async deleteRole(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id, 10);    
            const role = await RoleService.deleteRole(id);
    
            // Nếu không tìm thấy role để xóa
            if (!role) {
                return res.status(404).json({
                    "cod": 404,
                    "message": "Không tìm thấy vai trò cần xóa",
                });
            }
    
            // Nếu xóa thành công
            const data = {
                "cod": 200,
                "message": "Xóa thành công",
                "data": role,
            }
            return res.status(200).json(data);
        }
        catch (error) {
            console.error("Lỗi khi xóa vai trò:", error);
            return res.status(500).json({
                "cod": 500,
                "message": "Server error",
            });
        }
    }
    
}
export default RoleApiController;
