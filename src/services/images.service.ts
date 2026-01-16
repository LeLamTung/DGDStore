import Images from "../entities/Images"; // Sửa lại đường dẫn nếu cần
import Products from "../entities/Products"; // Sửa lại đường dẫn nếu cần
import { AppDataSource } from "../databases/data-source";
import { Request, Response } from "express";
import { Not } from "typeorm";
// Import Cloudinary và Helper từ Middleware (như bạn đã export ở các bước trước)
import { cloudinary, getPublicIdFromUrl } from "../middlewares/upload.middleware";

const ImagesRepository = AppDataSource.getRepository(Images);
const ProductsRepository = AppDataSource.getRepository(Products);

class ImagesService {

  static async getAllImages(): Promise<Images[]> {
    const data = await ImagesRepository.find({
      relations: ["Product"],
    });
    return data;
  }

  static async updateImage(id: number, data: any, files: Express.Multer.File[]) {

    // Xử lý boolean từ form-data
    const isMainImage = String(data.MainImage) === "true";
    // 🔍 1. Lấy thông tin ảnh hiện tại
    const image = await ImagesRepository.findOne({
      where: { idImage: id },
      relations: ["Product"],
    });
    if (!image) return null;// Trả về null để Controller báo 404

    const productId = image.Product?.idProduct;
    if (!productId) throw new Error("Ảnh không liên kết với sản phẩm nào!");

    // 📤 2. Nếu có file upload mới -> Thay thế ảnh cũ
    if (files && files.length > 0) {
      const file = files[0] as Express.Multer.File;

      // A. Xóa ảnh cũ trên Cloudinary (để tránh rác)
      if (image.ImageLink) {
        const publicId = getPublicIdFromUrl(image.ImageLink);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // B. Cập nhật Link mới (file.path là URL của Cloudinary)
      image.ImageLink = file.path;
    }

    // Cập nhật trạng thái ảnh chính
    // Nếu ảnh này được set là Main, thì cập nhật. 
    // Nếu user set là False, nhưng nó đang là True thì cần cân nhắc (thường logic FE sẽ chỉ cho set True)
    if (isMainImage) {
      image.MainImage = true;
    }

    // Lưu ảnh đã chỉnh sửa
    await ImagesRepository.save(image);

    //  Logic xử lý Ảnh Chính (MainImage)
    if (isMainImage) {
      // A. Set tất cả ảnh khác của sản phẩm này thành ảnh phụ
      await ImagesRepository.update(
        { Product: { idProduct: productId }, idImage: Not(id) },
        { MainImage: false }
      );

      // B. Cập nhật ảnh đại diện trong bảng Products luôn
      await ProductsRepository.update(productId, {
        ImageName: image.ImageLink,
      });
    }
    return image;

  }

  // 🗑️ Xóa ảnh
  static async deleteImage(id: number) {
    // 1. Tìm ảnh
    const image = await ImagesRepository.findOne({
      where: { idImage: id },
      relations: ["Product"],
    });

    if (!image) return null; // Trả về null để Controller báo 404

    const product = image.Product;
    if (!product) {
      // Trường hợp ảnh mồ côi (không có product), cứ xóa bình thường
      // Xóa trên Cloud
      const publicId = getPublicIdFromUrl(image.ImageLink || "");
      if (publicId) await cloudinary.uploader.destroy(publicId);
    }
    // Nếu không có sản phẩm (ảnh rác), xóa luôn
    if (!product) {
      await ImagesRepository.remove(image);
      return image;
    }

    // 3. Xử lý Logic nếu xóa phải Ảnh Chính
    if (image.MainImage) {
      // Tìm các ảnh còn lại của sản phẩm (trừ ảnh đang xóa)
      const remainingImages = await ImagesRepository.find({
        where: {
          Product: { idProduct: product.idProduct },
          idImage: Not(id)
        },
        order: { idImage: "ASC" } // Lấy ảnh cũ nhất làm chính, hoặc tùy logic
      });

      if (remainingImages.length > 0) {
        // A. Lấy ảnh đầu tiên trong danh sách còn lại làm ảnh chính mới
        const newMainImage = remainingImages[0];
        newMainImage.MainImage = true;
        await ImagesRepository.save(newMainImage);

        // B. Cập nhật bảng Product trỏ tới ảnh chính mới
        await ProductsRepository.update(product.idProduct!, {
          ImageName: newMainImage.ImageLink
        });
      } else {
        // C. Nếu không còn ảnh nào -> Product không còn ảnh đại diện
        await ProductsRepository.update(product.idProduct!, {
          ImageName: "" // Hoặc null tùy DB
        });
      }
    }

    // 4. Xóa record trong Database
    return await ImagesRepository.remove(image);
  }
}

export default ImagesService;