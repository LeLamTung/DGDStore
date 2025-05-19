import Images from "@entities/Images";
import { AppDataSource } from "@databases/data-source";
import { Request, Response } from "express";
import Products from "@entities/Products";
import { Not } from "typeorm";
import { unlink } from "fs";
import path from "path";
const ImagesRepository = AppDataSource.getRepository(Images);
const ProductsRepository = AppDataSource.getRepository(Products);
class ImagesService {
    static async getAllImages(): Promise<Images[]> {
        const data = await ImagesRepository.find({
            relations: ["Product"], 
        });
        return data;
    }
    static async updateImage(req: Request, res: Response): Promise<Response> {
        try {
            const idImage = Number(req.body.idImage);
            const isMainImage =
                req.body.MainImage === "true" || req.body.MainImage === true;

            // Tìm ảnh và sản phẩm liên kết
            const image = await ImagesRepository.findOne({
                where: { idImage },
                relations: ["Product"],
            });

            if (!image) {
                return res.status(404).json({ message: "Không tìm thấy ảnh" });
            }

            const productId = image.Product?.idProduct;
            if (!productId) {
                return res
                    .status(400)
                    .json({ message: "Ảnh không liên kết với sản phẩm nào!" });
            }

            // Upload ảnh mới (nếu có)
            if (Array.isArray(req.files) && req.files.length > 0) {
                const file = req.files[0] as Express.Multer.File;
                image.ImageLink = file.filename;
            }

            // Cập nhật trạng thái ảnh chính
            image.MainImage = isMainImage;

            await ImagesRepository.save(image);

            if (isMainImage) {
                // Đánh dấu các ảnh khác là phụ
                await ImagesRepository.update(
                    { Product: { idProduct: productId }, idImage: Not(idImage) },
                    { MainImage: false }
                );

                // Cập nhật ảnh chính của sản phẩm
                await ProductsRepository.update(productId, {
                    ImageName: image.ImageLink,
                });
            }

            return res.status(200).json({
                message: "Cập nhật ảnh thành công",
                data: image,
            });
        } catch (error) {
            console.error("Lỗi khi cập nhật ảnh:", error);

            const errMessage = (error as Error).message || error;

            return res.status(500).json({
                message: "Lỗi khi cập nhật ảnh",
                error: errMessage,
            });
        }
    }
    // Xóa ảnh

    static async deleteImage(req: Request) {
        const { id } = req.params; // Lấy id từ params
        const imageId = parseInt(id);
    
        try {
            // Tìm ảnh theo id
            const image = await ImagesRepository.findOne({
                where: { idImage: imageId },
                relations: ["Product"], // Quan hệ với Product
            });
    
            if (!image || !image.Product) {
                return null; // Trả về null nếu không tìm thấy ảnh hoặc không có sản phẩm
            }
    
            const product = image.Product;
    
            // Nếu ảnh chính bị xóa
            if (image.MainImage && product.Images && product.Images.length > 1) {
                // Tìm ảnh còn lại và đặt ảnh đầu tiên làm ảnh chính
                const newMainImage = product.Images.find(
                    (img) => img.idImage !== imageId
                );
                if (newMainImage) {
                    newMainImage.MainImage = true; // Đặt lại ảnh chính mới
                    await ImagesRepository.save(newMainImage);
                }
            }
    
            // Xóa ảnh
            await ImagesRepository.remove(image);
            return image; // Trả về ảnh đã xóa
        } catch (error) {
            console.error("Error deleting image:", error);
            throw new Error("Lỗi khi xóa ảnh");
        }
    }
    
    
}
export default ImagesService;
