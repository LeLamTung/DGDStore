import Images from "@entities/Images";
import ImagesService from "@services/images.service";
import { Request, Response } from "express";
class ImagesApiController {
  static async getAllImages(req: Request, res: Response) {
    try {
      const Images: Images[] = await ImagesService.getAllImages();
      const data = {
        cod: 200,
        data: Images,
      };
      res.json(data);
    } catch (error) {
      const data = {
        cod: 500,
        message: "Server error",
      };
      res.json(data);
    }
  }
  static async updateImages(req: Request, res: Response) {
    try {
      //  sẽ tự xử lý res
      await ImagesService.updateImage(req, res);
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

  static async deleteImages(req: Request, res: Response) {
    try {
      // Gọi service để xóa ảnh
      const image = await ImagesService.deleteImage(req);

      // Nếu không tìm thấy ảnh để xóa
      if (!image) {
        return res.status(404).json({
          cod: 404,
          message: "Không tìm thấy ảnh cần xóa",
        });
      }

      // Nếu xóa ảnh thành công
      const data = {
        cod: 200,
        message: "Xóa ảnh thành công",
        data: image, // Dữ liệu ảnh đã xóa
      };
      return res.status(200).json(data);
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      return res.status(500).json({
        cod: 500,
        message: "Lỗi server khi xóa ảnh",
      });
    }
  }
}
export default ImagesApiController;
