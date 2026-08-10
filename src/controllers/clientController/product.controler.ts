import Products from "@entities/Products";
import ClientProductsService from "@services/clientServices/product.service";
import { Request, Response } from "express";
class ProductsClientController {
    static async getAllProducts(req: Request, res: Response) {
        try {
            const Products: Products[] = await ClientProductsService.getAllProducts();
            const data = {
                "cod": 200,
                "data": Products,
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
    static async getProductById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({ message: "ID không hợp lệ" });
            }
            const Products = await ClientProductsService.getProductById(id);
            const data = {
                "cod": 200,
                "data": Products,
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
export default ProductsClientController;