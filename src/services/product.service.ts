import { AppDataSource } from "@databases/data-source";
import { Request, Response } from "express";
import Product from "@entities/Products";
import Image from "@entities/Images";
const ImageRepository = AppDataSource.getRepository(Image);
const ProductRepository = AppDataSource.getRepository(Product);

class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    const data: any = await ProductRepository.find();
    return data;
  }

  static async getProductById(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const product = await ProductRepository.findOne({
      where: { idProduct: id },
      relations: ["Category", "Images"],
    });
    return product;
  }

  static async createProduct(req: Request, res: Response) {
    const product = new Product();
    console.log("test loi", req.body);
    product.ProductName = req.body.ProductName;
    const percent = Number(req.body.SalePercentage) || 0;
    const priceOriginal = Number(req.body.OriginalPrice) || 0;
    const discount = (percent * priceOriginal) / 100;
    product.OriginalPrice = priceOriginal;
    product.SalePercentage = req.body.SalePercentage;
    if (!req.body.SalePrice) {
      product.SalePrice = req.body.OriginalPrice - discount;
    } else {
      product.SalePrice = req.body.SalePrice;
    }
    product.Description = req.body.Description || "Chưa có mô tả";
    product.IsSales = req.body.IsSales;
    product.IsHome = req.body.IsHome;
    product.Category = req.body.categoryIdCategory;

    if (req.files != null && Array.isArray(req.files) && req.files.length > 0) {
      const rDefault = Number(req.body.rDefault) || 0;
      const uploadedFiles = req.files.map((file) => file.filename);

      if (rDefault < 0 || rDefault >= uploadedFiles.length) {
        return { error: "Chỉ số ảnh chính không hợp lệ!" };
      }

      // Lưu ảnh chính vào bảng Product
      product.ImageName = uploadedFiles[rDefault];

      const imagesToSave: Image[] = [];
      req.files.forEach((file, index) => {
        const image = new Image();
        image.ImageLink = file.filename;
        image.Product = product;
        image.MainImage = index === rDefault;
        imagesToSave.push(image);
      });

      try {
        await ProductRepository.save(product);
        await ImageRepository.save(imagesToSave);
        return { product }; // Trả về dữ liệu sản phẩm
      } catch (error) {
        console.error("Error saving product or images:", error);
        return { error: "Lưu sản phẩm thất bại" }; // Trả về lỗi
      }
    } else {
      try {
        await ProductRepository.save(product);
        return { product }; // Trả về dữ liệu sản phẩm
      } catch (error) {
        return { error: "Lưu sản phẩm thất bại" }; // Trả về lỗi
      }
    }
  }

  static async updateProduct(data: any, req: Request, res: Response) {
    try {
      const { idProduct, ProductName, OriginalPrice, SalePercentage, Description, IsSales, IsHome, Category, SalePrice, } = data;
      const product = await ProductRepository.findOne({
        where: { idProduct },
        relations: ["Images"],
      });

      if (!product) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
      }

      const percent = Number(SalePercentage) || 0;
      const priceOriginal = Number(OriginalPrice) || 0;
      const discount = (percent * priceOriginal) / 100;
      
      // Cập nhật dữ liệu
      product.ProductName = ProductName ?? product.ProductName;
      product.OriginalPrice = priceOriginal;
      product.SalePercentage = percent;
      product.Description = Description ?? product.Description;
      product.IsHome = IsHome ?? product.IsHome;
      product.IsSales = IsSales ?? product.IsSales;
      product.Category = Category ?? product.Category;
      
      // Nếu OriginalPrice hoặc SalePercentage thay đổi, tính lại SalePrice
      const newSalePrice = priceOriginal - discount;
      if (SalePrice === undefined || SalePrice === product.SalePrice) {
        product.SalePrice = newSalePrice;
      } else {
        product.SalePrice = SalePrice;
      }
      

      // Xử lý ảnh chính (ImageName)
      const mainImage = req.body.mainImage; // mainImage từ frontend

      if (mainImage) {
        // Cập nhật tên ảnh chính
        product.ImageName = mainImage; // Giả sử mainImage là tên của file ảnh
      }
      await ProductRepository.save(product);

      return res.status(200).json({
        message: "Cập nhật sản phẩm thành công!",
        data: product,
      });
    } catch (error) {
      console.error("Lỗi cập nhật sản phẩm:", error);
      return res.status(500).json({
        message: "Cập nhật sản phẩm thất bại",
        error,
      });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const product = await ProductRepository.findOne({
      where: { idProduct: id },
      relations: ["Images"],
    }); // relation để hiển thị ra tất cả các mối quan hệ của sản phẩmẩm
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    // vì là có quan hệ với "Image" và "category" nên không thể xóa được ("sẽ hiện thị là không thể xóa được vì idProduct còn liên quan đến ảnh và Category")

    if (product.Images && product.Images.length > 0) {
      // vì vậy nên cần phải xóa ảnh trước để "Product" không còn liên quan tới ảnh khác, ở đây là bảng "Image"
      await ImageRepository.remove(product.Images);
    }
    // sau khi đã xóa được ảnh thì "Product" sẽ không liên quan đến bảng nào nữa nên có thể xóa được.
    try {
      await ProductRepository.remove(product);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
    return product;
  }
}

export default ProductService;
