import { AppDataSource } from "@databases/data-source";
import { Request, Response } from "express";
import Product from "@entities/Products";
import Image from "@entities/Images";
import PriceHistory from "@entities/PriceHistory";
import upload, { getPublicIdFromUrl, cloudinary } from "../middlewares/upload.middleware";

const ImageRepository = AppDataSource.getRepository(Image);
const ProductRepository = AppDataSource.getRepository(Product);
const PriceHistoryRepository = AppDataSource.getRepository(PriceHistory);

class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    const data: any = await ProductRepository.find();
    return data;
  }

  static async getProductById(id: number) {
    const product = await ProductRepository.findOne({
      where: { idProduct: id },
      relations: ["Category", "Images", "PriceHistories"],
      order: {
        PriceHistories: { ChangedAt: "DESC" }
      }
    });
    return product;
  }

  static async createProduct(data: any, files: Express.Multer.File[]) {
    try {
      const product = new Product();
      
      product.ProductName = data.ProductName;
      product.Stock = Number(data.Stock) || 0;
      
      // --- LOGIC TÍNH GIÁ MỚI ---
      const priceOriginal = Number(data.OriginalPrice) || 0;
      let finalSalePrice = 0;
      let finalPercent = 0;

      if (data.SalePrice !== undefined && data.SalePrice !== "") {
        finalSalePrice = Number(data.SalePrice);
        if (priceOriginal > 0) {
            finalPercent = ((priceOriginal - finalSalePrice) / priceOriginal) * 100;
        } else {
            finalPercent = 0;
        }
      } 
      else if (data.SalePercentage !== undefined && data.SalePercentage !== "") {
        finalPercent = Number(data.SalePercentage);
        const discount = (finalPercent * priceOriginal) / 100;
        finalSalePrice = priceOriginal - discount;
      } 
      else {
        finalSalePrice = priceOriginal;
        finalPercent = 0;
      }

      // [CHECK RÀNG BUỘC]
      if (finalSalePrice > priceOriginal) {
        throw new Error("Giá khuyến mãi (SalePrice) không được lớn hơn giá gốc (OriginalPrice)!");
      }
      if (finalSalePrice < 0) {
        throw new Error("Giá bán không được âm!");
      }

      product.OriginalPrice = priceOriginal;
      product.SalePercentage = parseFloat(finalPercent.toFixed(2)); 
      product.SalePrice = finalSalePrice;
      // -------------------------------

      product.Description = data.Description || "Chưa có mô tả";
      product.IsSales = String(data.IsSales) === "true";
      product.IsHome = String(data.IsHome) === "true";
      product.Category = data.categoryIdCategory;

      // 1. XỬ LÝ ẢNH ĐẠI DIỆN (ImageName) TRƯỚC KHI LƯU
      // Đưa logic check file ra ngoài để lấy ImageName, chưa lưu vội
      let rDefault = 0;
      if (files && files.length > 0) {
        rDefault = Number(data.rDefault) || 0;
        if (rDefault < 0 || rDefault >= files.length) {
          throw new Error("Chỉ số ảnh chính không hợp lệ!");
        }
        const mainFile = files[rDefault] ? files[rDefault] : files[0];
        product.ImageName = mainFile.path;
      } else {
        product.ImageName = "";
      }
        
      // 2. LƯU SẢN PHẨM (Logic chung cho cả 2 trường hợp có ảnh và không ảnh)
      const savedProduct = await ProductRepository.save(product);

      // 3. LƯU LỊCH SỬ GIÁ (BẮT BUỘC CHẠY)
      // Đã đưa ra ngoài if-else để đảm bảo luôn chạy
      const newPriceHistory = new PriceHistory();
      newPriceHistory.Product = savedProduct;
      newPriceHistory.OriginalPrice = savedProduct.OriginalPrice;
      newPriceHistory.SalePrice = savedProduct.SalePrice;
      newPriceHistory.Reason = "Khởi tạo sản phẩm";
      const savedphistory = await PriceHistoryRepository.save(newPriceHistory);

      // 4. LƯU CÁC ẢNH VÀO BẢNG IMAGE (Nếu có file upload)
      let imagesToSave: Image[] = [];
      if (files && files.length > 0) {
        imagesToSave = files.map((file, index) => {
          const image = new Image();
          image.ImageLink = file.path;
          image.Product = savedProduct;
          image.MainImage = index === rDefault;
          return image;
        });
        await ImageRepository.save(imagesToSave);
      }

      // Trả về kết quả
      return { 
          product: savedProduct, 
          images: imagesToSave, 
          pricehistory: savedphistory 
      };

    } catch (error) {
      console.error("Lỗi service createProduct:", error);
      throw error;
    }
  }

  static async updateProduct(id: number, data: any, files: Express.Multer.File[]) {
    const product = await ProductRepository.findOne({
      where: { idProduct: id },
      relations: ["Category", "Images", "PriceHistories"],
    });

    if (!product) return null;

    const oldSalePrice = Number(product.SalePrice);

    // 1. UPDATE THÔNG TIN CƠ BẢN
    if (data.ProductName) product.ProductName = data.ProductName;
    if (data.Stock) product.Stock = Number(data.Stock);
    if (data.Description) product.Description = data.Description;
    
    if (data.IsHome !== undefined) product.IsHome = String(data.IsHome) === "true";
    if (data.IsSales !== undefined) product.IsSales = String(data.IsSales) === "true";
    if (data.categoryIdCategory) product.Category = data.categoryIdCategory;

    // --- LOGIC TÍNH GIÁ MỚI CHO UPDATE ---
    const newOriginalPrice = data.OriginalPrice !== undefined && data.OriginalPrice !== "" 
        ? Number(data.OriginalPrice) 
        : Number(product.OriginalPrice);
    
    let newSalePriceResult = 0;
    let newPercentResult = 0;

    if (data.SalePrice !== undefined && data.SalePrice !== "") {
        newSalePriceResult = Number(data.SalePrice);
        if (newOriginalPrice > 0) {
             newPercentResult = ((newOriginalPrice - newSalePriceResult) / newOriginalPrice) * 100;
        } else {
             newPercentResult = 0;
        }
    }
    else if (data.SalePercentage !== undefined && data.SalePercentage !== "") {
        newPercentResult = Number(data.SalePercentage);
        const discount = (newPercentResult * newOriginalPrice) / 100;
        newSalePriceResult = newOriginalPrice - discount;
    }
    else {
        if (data.OriginalPrice !== undefined && data.OriginalPrice !== "") {
            newSalePriceResult = newOriginalPrice;
            newPercentResult = 0;
        } else {
            newSalePriceResult = Number(product.SalePrice);
            newPercentResult = Number(product.SalePercentage);
        }
    }

    // [CHECK RÀNG BUỘC]
    if (newSalePriceResult > newOriginalPrice) {
        throw new Error("Giá khuyến mãi không được lớn hơn giá gốc!");
    }
    if (newSalePriceResult < 0) {
        throw new Error("Giá bán không được âm!");
    }

    product.OriginalPrice = newOriginalPrice;
    product.SalePercentage = parseFloat(newPercentResult.toFixed(2));
    product.SalePrice = newSalePriceResult;

    // 2. XỬ LÝ ẢNH MỚI
    if (files && files.length > 0) {
      const newImages = files.map(file => {
        const image = new Image();
        image.ImageLink = file.path;
        image.Product = product;
        image.MainImage = false;
        return image;
      });
      await ImageRepository.save(newImages);
    }

    // 3. XỬ LÝ ĐỔI ẢNH ĐẠI DIỆN
    if (data.ImageName) {
      product.ImageName = data.ImageName;
    } else if (files && files.length > 0) {
      product.ImageName = files[0].path;
    }

    const savedProduct = await ProductRepository.save(product);

    // 4. LƯU LỊCH SỬ GIÁ
    if (oldSalePrice !== Number(savedProduct.SalePrice)) {
        const newPriceHistory = new PriceHistory();
        newPriceHistory.Product = savedProduct;
        newPriceHistory.OriginalPrice = savedProduct.OriginalPrice;
        newPriceHistory.SalePrice = savedProduct.SalePrice;
        newPriceHistory.Reason = data.Reason || `Cập nhật giá: ${oldSalePrice} -> ${savedProduct.SalePrice}`;
        await PriceHistoryRepository.save(newPriceHistory);
    }

    return await ProductRepository.findOne({
      where: { idProduct: id },
      relations: ["Category", "Images", "PriceHistories"],
      order: { PriceHistories: { ChangedAt: "DESC" }}
    });
  }

  static async deleteProduct(id: number) {
    const product = await ProductRepository.findOne({
      where: { idProduct: id },
      relations: ["Category", "Images"],
    });

    if (!product) return null;

    const imagesToDelete: string[] = [];
    if (product.ImageName) imagesToDelete.push(product.ImageName);
    if (product.Images && product.Images.length > 0) {
      product.Images.forEach(img => {
        if (img.ImageLink) imagesToDelete.push(img.ImageLink)
      });
    }

    if (imagesToDelete.length > 0) {
      try {
        const deletePromises = imagesToDelete.map(url => {
          const publicId = getPublicIdFromUrl(url);
          if (publicId) return cloudinary.uploader.destroy(publicId);
        });
        await Promise.all(deletePromises);
      } catch (err) {
        console.error("Lỗi xóa ảnh trên Cloud:", err);
      }
    }

    if (product.Images && product.Images.length > 0) {
      await ImageRepository.remove(product.Images);
    }
    
    return await ProductRepository.remove(product);
  }
  static async getPriceHistoryByProductId(productId: number) {
    const history = await PriceHistoryRepository.find({
      where: { Product: { idProduct: productId } },
      order: { ChangedAt: "ASC" }, // Sắp xếp cũ -> mới để vẽ biểu đồ
      select: ["idPriceHistory", "OriginalPrice", "SalePrice", "Reason", "ChangedAt"]
    });
    return history;
  }
}

export default ProductService;