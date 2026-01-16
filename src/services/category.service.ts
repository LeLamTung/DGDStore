import Categories from "../entities/Categories"; // Sửa lại đường dẫn nếu cần
import { AppDataSource } from "../databases/data-source"; // Sửa lại đường dẫn nếu cần
import { Request, Response } from "express";
// Import Cloudinary và Helper từ Middleware
import { cloudinary, getPublicIdFromUrl } from "../middlewares/upload.middleware";

const CategoriesRepository = AppDataSource.getRepository(Categories);

class CategoriesService {
    
    static async getAllCategories(): Promise<Categories[]> {
        const data = await CategoriesRepository.find();
        return data;
    }

    static async getCategoryById(id: number): Promise<Categories | null> {
        const data = await CategoriesRepository.findOne({ where: { idCategory: id } });
        return data;
    }

    // --- TẠO DANH MỤC MỚI ---
    static async createCategories(data: any, files: Express.Multer.File[]){
        try {
            const r1: Categories = new Categories();
            r1.CategoryName = data.CategoryName;

            // Xử lý ảnh upload
            if (files && files.length > 0) {
                // SỬA: Dùng file.path (URL Cloudinary) thay vì filename
                // Nếu cho phép nhiều ảnh thì nối chuỗi bằng dấu phẩy
                r1.CategoryImage = files.map(file => file.path).join(","); 
            } else {
                r1.CategoryImage = "";
            }

            return await CategoriesRepository.save(r1);
        } catch (error) {
            console.error("Lỗi tạo danh mục:", error);
            throw error;
        }
    }

    // --- XÓA DANH MỤC ---
    static async deleteCategories(idCategory: number) {
        // 1. Tìm danh mục
        const category = await CategoriesRepository.findOne({ where: { idCategory } });
        
        if (!category) {
            return null; 
        }

        // 2. Xóa ảnh trên Cloudinary (nếu có)
        if (category.CategoryImage) {
            // Vì logic create đang nối chuỗi bằng dấu phẩy (join(",")), nên lúc xóa phải tách ra
            const imageUrls = category.CategoryImage.split(",");
            
            const deletePromises = imageUrls.map(url => {
                const publicId = getPublicIdFromUrl(url.trim());
                if (publicId) return cloudinary.uploader.destroy(publicId);
            });
            
            try {
                await Promise.all(deletePromises);
            } catch (err) {
                console.error("Lỗi xóa ảnh danh mục trên Cloudinary:", err);
            }
        }

        // 3. Xóa trong DB
        await CategoriesRepository.delete(idCategory);
        return category; 
    }

    // --- CẬP NHẬT DANH MỤC ---
    static async updateCategories(id: number, data: any, files: Express.Multer.File[]): Promise<Categories> {
        const r1 = await CategoriesRepository.findOneBy({ idCategory: id });
        
        if (!r1) throw new Error("Categories not found");

        r1.CategoryName = data.CategoryName || r1.CategoryName;

        // Kiểm tra xem có upload ảnh mới không
        if (files && files.length > 0) {

            // A. Xóa ảnh cũ đi trước (Dọn rác)
            if (r1.CategoryImage) {
                const oldUrls = r1.CategoryImage.split(",");
                const deletePromises = oldUrls.map(url => {
                    const publicId = getPublicIdFromUrl(url.trim());
                    if (publicId) return cloudinary.uploader.destroy(publicId);
                });
                // Không await ở đây để tiết kiệm thời gian, cho nó chạy ngầm
                Promise.all(deletePromises).catch(err => console.error("Lỗi xóa ảnh cũ:", err));
            }

            // B. Cập nhật ảnh mới (Lấy URL từ Cloudinary)
            r1.CategoryImage = files.map(file => file.path).join(",");
        } 
        // Nếu không gửi file mới thì giữ nguyên r1.CategoryImage cũ

        return await CategoriesRepository.save(r1);
    }
}

export default CategoriesService;