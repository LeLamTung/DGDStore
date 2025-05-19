import Categories from "@entities/Categories";
import ClientCategoriesService from "@services/clientServices/category.service";
import { Request, Response } from "express";
class CategoriesClientController {
    static async getAllCategories(req: Request, res: Response) {
        try {
            const Categories: Categories[] = await ClientCategoriesService.getAllCategories();
            const data = {
                "cod": 200,
                "data": Categories,
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
}
export default CategoriesClientController;