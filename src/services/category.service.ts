import Categories from "@entities/Categories";
import { AppDataSource } from "@databases/data-source";
import { Request, Response } from "express";
import axios from "axios";
const CategoriesRepository = AppDataSource.getRepository(Categories);
class CategoriesService {
    static async getAllCategories(): Promise<Categories[]> {
        const data: any = await CategoriesRepository.find()
        return data;
    }
    static async getCategoryById(req:Request): Promise<Categories[]> {
        const id = parseInt(req.params.id);
        const data: any = await CategoriesRepository.findOne( {where:{idCategory:id}} )
        return data;
    }
    static async createCategories(req: Request, res: Response) {
        const r1: Categories = new Categories();
        r1.CategoryName = req.body.CategoryName;
        if (Array.isArray(req.files)) {
            r1.CategoryImage = req.files.map((file: Express.Multer.File) => file.filename).join(",") || "";
        } else {
            r1.CategoryImage = "";
        }

        return await CategoriesRepository.save(r1);
    }
    static async deleteCategories(idCategory: number) {
        // Kiểm tra Categories có tồn tại không trước khi xóa
        const Categories = await CategoriesRepository.findOne({ where: { idCategory } });
        if (!Categories) {
            return null; // Trả về null nếu không tìm thấy
        }
        await CategoriesRepository.delete(idCategory);
        return Categories; // Trả về thông tin Categories đã xóa
    }


    static async updateCategories(req: Request, res: Response): Promise<Categories> {
        const id = req.body.idCategory;
        const r1 = await CategoriesRepository.findOneBy({ idCategory: id });
        if (!r1) throw new Error("Categories not found");

        r1.CategoryName = req.body.CategoryName || r1.CategoryName;
        let uploadedImages = "";
        if (Array.isArray(req.files)) {
            uploadedImages = req.files.map((file: Express.Multer.File) => file.filename).join(",") || "";
        }
        r1.CategoryImage = uploadedImages || r1.CategoryImage;
        return await CategoriesRepository.save(r1);
    }


}
export default CategoriesService;