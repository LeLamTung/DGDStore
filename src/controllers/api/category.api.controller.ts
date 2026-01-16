import Categories from "@entities/Categories";
import CategoriesService from "@services/category.service";
import { Request, Response } from "express";
class CategoriesApiController {
    static async getAllCategories(req: Request, res: Response) {
        try {
            const Categories: Categories[] = await CategoriesService.getAllCategories();
            const data = {
                "cod": 200,
                "data": Categories,
            }
            res.status(200).json(data);
        }
        catch (error) {
            const data = {
                "cod": 500,
                "message": "Server error",
            }
            res.status(500).json(data);
        }
    }
    static async getCategoryById(req: Request, res: Response) {
        try {
            const id= parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({message: "ID không hợp lệ"});
            }
            const Category = await CategoriesService.getCategoryById(id);
            // Thêm check 404 nếu không tìm thấy
            if (!Category) {
                return res.status(404).json({
                    "cod": 404,
                    "message": "Không tìm thấy danh mục",
                });
            }
            const data = {
                "cod": 200,
                "data": Category,
            }
            res.status(200).json(data);
        }
        catch (error) {
            const data = {
                "cod": 500,
                "message": "Server error",
            }
            res.status(500).json(data);
        }
    }
    static async storeCategories(req: Request, res: Response) {
        try {
            const data = req.body;
            const files = req.files as Express.Multer.File[];
            const Categories = await CategoriesService.createCategories(data, files);
            res.status(201).json({
                "cod": 200,
                "message": "Thêm mới thành công",
                "data": Categories,
            });
        } catch (error) {
            res.status(500).json({
                "cod": 500,
                "message": "Server error",
            });
        }
    }
    
    static async updateCategories(req: Request, res: Response) {
        try {
            const data = req.body;
            const files = req.files as Express.Multer.File[];
            const id = parseInt(req.params.id)
            if (isNaN(id)) {
                return res.status(400).json({ message: "ID không hợp lệ" });
            }
            const Categories = await CategoriesService.updateCategories(id,data, files);
            res.status(200).json({
                "cod": 200,
                "message": "Cập nhật thành công",
                "data": Categories,
            });
        } catch (error) {
            res.status(500).json({
                "cod": 500,
                "message": "Server error",
            });
        }
    }
    
    
    
    static async deleteCategories(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({message:" ID không hợp lệ" });
            } 
            const Categories = await CategoriesService.deleteCategories(id);
    
            // Nếu không tìm thấy Categories để xóa
            if (!Categories) {
                return res.status(404).json({
                    "cod": 404,
                    "message": "Không tìm thấy thể loại cần xóa",
                });
            }
    
            // Nếu xóa thành công
            const data = {
                "cod": 200,
                "message": "Xóa thành công",
                "data": Categories,
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
    // static async index(req: Request, res: Response) {
    //     const result = await CategoriesService.getDisplayCategories();
    //     const data = result.data;
    //     const {main} = data;
    //     res.render('ta.ejs', main, datta);
    // }
    
}
export default CategoriesApiController;
