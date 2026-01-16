import Products from "@entities/Products";
import AiService from "@services/ai.service";
import ProductsService from "@services/product.service";
import { Request, Response } from "express";
class ProductsApiController {
    static async getAllProducts(req: Request, res: Response) {
        try {
            const Products: Products[] = await ProductsService.getAllProducts();
            res.status(200).json({
                cod: 200,
                message: "Lấy danh sách sản phẩm thành công",
                data: Products,
            });
        }
        catch (error: any) {
            console.error("Lỗi lấy danh sách sản phẩm:", error);
            res.status(500).json({
                cod: 500,
                message: "Server error",
            });
        }
    }
    static async getProductById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ message: "ID không hợp lệ" });
            const Products = await ProductsService.getProductById(id);
            res.status(200).json({
                cod: 200,
                message: "Lấy chi tiết sản phẩm thành công",
                data: Products,
            });
        }

        catch (error) {
            console.error("Lỗi lấy chi tiết sản phẩm:", error);
            res.status(500).json({
                cod: 500,
                message: "Server error",
            });
        }
    }
    // static async getDetailProduct(req: Request, res: Response) {
    //     try {
    //       const product = await ProductsService.getProductById(req, res);
    //       const data = {
    //         message: "Product fetched successfully",
    //         data: product,
    //       };
    //       res.json(data);
    //     } catch (err) {
    //       const data = {
    //         message: "Error fetching product",
    //       };
    //       res.json(data);
    //     }
    //   }
    static async storeProducts(req: Request, res: Response) {
        try {
            // Controller bóc tách dữ liệu
            const files = req.files as Express.Multer.File[];
            const data = req.body;

            // Gọi Service với tham số sạch
            const result = await ProductsService.createProduct(data, files);

            res.status(201).json({
                cod: 200,
                message: "Thêm mới thành công",
                data: result
            });
        } catch (error: any) {
            // Bắt lỗi từ Service ném ra
            console.error(error);
            const message = error.message || "Server error";
            res.status(500).json({
                cod: 500,
                message: message
            });
        }
    }
    static async updateProducts(req: Request, res: Response) {
        try {
            // Lấy ID từ URL
            const id = parseInt(req.params.id);
            console.log("Updating product with ID:", id);
            if (isNaN(id)) return res.status(400).json({ message: "ID không hợp lệ" });

            const files = req.files as Express.Multer.File[];
            const data = req.body;

            // Gọi Service với ID, Data và Files
            const updatedProduct = await ProductsService.updateProduct(id, data, files);

            if (!updatedProduct) {
                return res.status(404).json({
                    cod: 404,
                    message: "Không tìm thấy sản phẩm"
                });
            }

            res.status(200).json({
                cod: 200,
                message: "Cập nhật thành công",
                data: updatedProduct
            });

        } catch (error) {
            console.error("Lỗi updateProducts:", error);
            if (!res.headersSent) {
                res.status(500).json({
                    cod: 500,
                    message: "Server error",
                });
            }
        }
    }

    static async deleteProducts(req: Request, res: Response) {
        try {
            // 1. Lấy ID và ép kiểu số
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                return res.status(400).json({
                    cod: 400,
                    message: "ID sản phẩm không hợp lệ"
                });
            }

            // 2. Gọi Service (Service chỉ trả về data, không gửi response)
            const deletedProduct = await ProductsService.deleteProduct(id);

            // 3. Kiểm tra kết quả từ Service
            if (!deletedProduct) {
                // Nếu Service trả về null nghĩa là không tìm thấy
                return res.status(404).json({
                    cod: 404,
                    message: "Không tìm thấy sản phẩm cần xóa",
                });
            }

            // 4. Nếu xóa thành công
            return res.status(200).json({
                cod: 200,
                message: "Xóa thành công",
                data: deletedProduct, // Trả về thông tin sản phẩm vừa xóa
            });

        } catch (error: any) {
            console.error("Lỗi controller xóa sản phẩm:", error);
            // Chỉ gửi message lỗi, không gửi object circular
            return res.status(500).json({
                cod: 500,
                message: "Lỗi Server khi xóa sản phẩm",
                error: error.message
            });
        }
    }
    static getPriceHistory = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            const data = await ProductsService.getPriceHistoryByProductId(id);
            return res.status(200).json({
                message: "Lấy lịch sử giá thành công",
                data: data
            });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server", error });
        }
    }
    static async suggestPrice(req: Request, res: Response) {
        try {
            const { ProductName, OriginalPrice, Description, CategoryName } = req.body;

            // Validate cơ bản
            if (!ProductName || !OriginalPrice) {
                return res.status(400).json({ message: "Cần nhập Tên SP và Giá gốc để AI tính toán" });
            }

            const suggestion = await AiService.suggestPrice(req.body);

            return res.status(200).json({
                cod: 200,
                message: "Gợi ý thành công",
                data: suggestion
            });

        } catch (error: any) {
            return res.status(500).json({
                cod: 500,
                message: "Lỗi AI Server",
                error: error.message
            });
        }
    }
}
export default ProductsApiController;
