import { AppDataSource } from "@databases/data-source";
import { Request, Response } from "express";
import Product from "@entities/Products";
import Image from "@entities/Images";
const ImageRepository = AppDataSource.getRepository(Image);
const ProductRepository = AppDataSource.getRepository(Product);

class ClientProductService {
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
}
export default ClientProductService;