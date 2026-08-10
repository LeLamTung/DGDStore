import Images from "@entities/Images";
import ImagesService from "@services/images.service";
import { Request, Response } from "express";
class ImagesApiController {
  static async getAllImages(req: Request, res: Response) {
    try {
      const images: Images[] = await ImagesService.getAllImages();
      return res.status(200).json({
        cod: 200,
        data: images,
      });
    } catch (error) {
      return res.status(500).json({ cod: 500, message: "Server error" });
    }
  }
  static async updateImages(req: Request, res: Response) {
    try {
      //  sẽ tự xử lý res
      const id = Number(req.body.idImage);
      if(isNaN(id)) return res.status(400).json({ message: "ID ảnh không hợp lệ" });
      const files = req.files as Express.Multer.File[];
      const data = req.body;

      const updatedImage = await ImagesService.updateImage(id, data, files);
      if (!updatedImage) {
          return res.status(404).json({ cod: 404, message: "Không tìm thấy ảnh" });
      }

      return res.status(200).json({
        cod: 200,
        message: "Cập nhật ảnh thành công",
        data: updatedImage
      });
    } catch (error: any) {
      console.error("Lỗi updateImages:", error);
      return res.status(500).json({
          cod: 500,
          message: error.message || "Server error",
      });
    }

  }

  static async deleteImages(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "ID không hợp lệ" });

      const deletedImage = await ImagesService.deleteImage(id);

      if (!deletedImage) {
        return res.status(404).json({
          cod: 404,
          message: "Không tìm thấy ảnh cần xóa",
        });
      }

      return res.status(200).json({
        cod: 200,
        message: "Xóa ảnh thành công",
        data: deletedImage,
      });
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      return res.status(500).json({ cod: 500, message: "Lỗi server khi xóa ảnh" });
    }
  }
}
export default ImagesApiController;
