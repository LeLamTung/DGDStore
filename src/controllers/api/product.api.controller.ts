import Products from "@entities/Products";
import ProductsService from "@services/product.service";
import { Request, Response } from "express";
class ProductsApiController {
    static async getAllProducts(req: Request, res: Response) {
        try {
            const Products: Products[] = await ProductsService.getAllProducts();
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
            const Products = await ProductsService.getProductById(req,res);
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
    static async storeProducts(req: Request, res: Response) {
        try {
            const result = await ProductsService.createProduct(req, res);
    
            if (result.error) {
                return res.status(400).json({
                    cod: 400,
                    message: result.error,  // Nếu có lỗi, trả về lỗi tương ứng
                });
            }
    
            const data = {
                cod: 200,
                message: "Thêm mới thành công",
                data: result.product,  // Trả về sản phẩm mới tạo
            };
            res.status(201).json(data);
        } catch (error) {
            const data = {
                cod: 500,
                message: "Server error",
            };
            console.log(error);
            res.status(500).json(data);
        }
    }
    static async updateProducts(req: Request, res: Response) {
        try {
            // service sẽ tự xử lý res
            await ProductsService.updateProduct(req.body, req, res);
        } catch (error) {
            console.error("Lỗi updateProducts:", error);
            // Tránh gửi thêm nếu đã gửi ở service — dùng return để dừng
            if (!res.headersSent) {
                res.status(500).json({
                    cod: 500,
                    message: "Server error",
                });
            }
        }
    }
    
    static async getDetailProduct(req: Request, res: Response) {
        try {
          const product = await ProductsService.getProductById(req, res);
          const data = {
            message: "Product fetched successfully",
            data: product,
          };
          res.json(data);
        } catch (err) {
          const data = {
            message: "Error fetching product",
          };
          res.json(data);
        }
      }
    static async deleteProducts(req: Request, res: Response) {
        try {
            const Products = await ProductsService.deleteProduct(req,res);
    
            // Nếu không tìm thấy Products để xóa
            if (!Products) {
                return res.status(404).json({
                    "cod": 404,
                    "message": "Không tìm thấy mặt hàng cần xóa",
                });
            }
    
            // Nếu xóa thành công
            const data = {
                "cod": 200,
                "message": "Xóa thành công",
                "data": Products,
            }
            return res.status(200).json(data);
        }
        catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            return res.status(500).json({
                "cod": 500,
                "message": "Server error",
            });
        }
    }
    
}
export default ProductsApiController;
