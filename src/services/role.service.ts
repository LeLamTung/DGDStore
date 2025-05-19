import Role from "@entities/Role";
import { AppDataSource } from "@databases/data-source";
const roleRepository = AppDataSource.getRepository(Role);
class RoleService {
    static async getAllRoles(): Promise<Role[]> {
        const data: any = await roleRepository.find()
        return data;
    }
    static async getRoleById(id: number): Promise<Role | null> {
        try {
            const role = await roleRepository.findOneBy({ idRole: id });
    
            if (!role) {
                throw new Error("Role không tồn tại");
            }
    
            return role;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin Role:", error);
            throw new Error("Lỗi khi lấy thông tin Role");
        }
    }
    static async createRole(data: any) {
        const { NameRole } = data;
        const r1: Role = new Role();
        r1.NameRole = NameRole;
        return await roleRepository.save(r1);
    }
    static async deleteRole(idRole: number) {
        // Kiểm tra role có tồn tại không trước khi xóa
        const role = await roleRepository.findOne({ where: { idRole } });
        if (!role) {
            return null; // Trả về null nếu không tìm thấy
        }
        await roleRepository.delete(idRole);
        return role; // Trả về thông tin role đã xóa
    }
    
    
    static async updateRole(data: any): Promise<Role> {
        const { idRole, NameRole } = data;
        if (!idRole) throw new Error("Thiếu ID người dùng");
    
        const role = await roleRepository.findOneBy({ idRole });
        if (!role) throw new Error("Role không tồn tại");
    
        role.NameRole = NameRole || role.NameRole;
       
        return await roleRepository.save(role);
    }
}
export default RoleService;