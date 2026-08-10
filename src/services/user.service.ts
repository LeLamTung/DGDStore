import User from "@entities/Users";
import Role from "@entities/Roles";
import bcrypt from "bcrypt";
import { AppDataSource } from "@databases/data-source";
import { OAuth2Client } from 'google-auth-library';

const roleRepository = AppDataSource.getRepository(Role);
const userRepository = AppDataSource.getRepository(User);
const client_id = process.env.GG_CLIENT_ID;
const client = new OAuth2Client(client_id);
class UserService {
    static async getAllUsers(): Promise<User[]> {
        const data: any = await userRepository.find(
            {
                relations: ["Role"],
            }
        )
        return data;
    }
    static async getUserById(id: number): Promise<User | null> {
        try {
            const user = await userRepository.findOne({
                where: { idUser: id },
                relations: ["Role"],
            });

            if (!user) {
                throw new Error("User không tồn tại");
            }

            return user;
        } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
            throw new Error("Lỗi khi lấy thông tin user");
        }
    }
    static async createUser(data: any) {
        const { UserName, Email, Password, IsActive } = data
        const u1: User = new User();
        u1.UserName = UserName;
        u1.Email = Email;
        // Mã hóa mật khẩu nè
        u1.Password = await bcrypt.hash(Password, 10);
        u1.IsActive = IsActive ? IsActive : true;
        const role = await roleRepository.findOne({
            where: {
                NameRole: 'Customer',
            },
        });
        if (role) {
            u1.Role = role;
        }
        return await userRepository.save(u1);
    }
    static async loginGoogle(data: { gg_token: string }) {
        const { gg_token } = data;
        try{
        const ticket = await client.verifyIdToken({
            idToken: gg_token,
            audience: client_id,
        });
        
        const payload = ticket.getPayload();
        console.log("Google Payload:", payload);
        if (!payload || !payload.email || !payload.sub || !payload.name) {
            throw new Error("Dữ liệu Google không hợp lệ hoặc thiếu thông tin");
        }

        const email = payload.email;
        const googleId = payload.sub;
        const userName = payload.name;

        // Tìm user theo email
        let user = await userRepository.findOne({
            where: { Email: email },
            relations: ["Role"],
        });

        const role = await roleRepository.findOneBy({ NameRole: "Customer" });
        if (!role) throw new Error("Không tìm thấy vai trò mặc định");

        if (user) {
            // Nếu đã có tài khoản nhưng chưa có GoogleId → gán vào
            if (!user["GoogleId"]) {
                user.GoogleId = googleId;
                user.UserName = user.UserName || userName; // cập nhật nếu chưa có
                user.Role = user.Role || role;
                await userRepository.save(user);
            }
            return user;
        }

        // Nếu chưa có user thì tạo mới
        const newUser = new User();
        newUser.Email = email;
        newUser.UserName = userName;
        newUser.Password = ""; // không có password
        newUser.IsActive = true;
        newUser.Role = role;
        newUser.GoogleId = googleId;

        return  await userRepository.save(newUser);
        
    
    } catch (error) {
        console.error("Lỗi xác thực Google:", error);
        throw new Error("Xác thực Google thất bại: Token không hợp lệ hoặc đã hết hạn.");
    }
}

    static async deleteUser(id: any) {
        return await userRepository.delete(id);
    }



    static async updateUser(data: any): Promise<User> {
        const { idUser, UserName, Email, Password, IsActive } = data;
        if (!idUser) throw new Error("Thiếu ID người dùng");

        const user = await userRepository.findOneBy({ idUser });
        if (!user) throw new Error("User không tồn tại");

        user.UserName = UserName || user.UserName;
        user.Email = Email || user.Email;
        if (Password) {
            user.Password = Password; // Hash password nếu cần
        }
        user.IsActive = IsActive ?? user.IsActive;
        user.Role = data.Role || user.Role; // Cập nhật vai trò nếu có

        return await userRepository.save(user);
    }

    static async getAccountbyEmailandPassword(data: any): Promise<any> {
        const { Email, Password } = data;

        // Tìm user theo email
        const user = await userRepository.findOne({
            where: { Email: Email },
            relations: ["Role"],
        });
        console.log('Day la user service',user);

        if (!user) return null; // Không tìm thấy user

        // So sánh mật khẩu nhập vào với mật khẩu đã băm
        if (!Password || !user.Password) {
            throw new Error("Password is missing or invalid");
        }
        const isMatch = await bcrypt.compare(Password, user.Password);
        if (!isMatch) return null; // Sai mật khẩu

        return user; // Trả về user nếu đúng mật khẩu
    }

}

export default UserService;