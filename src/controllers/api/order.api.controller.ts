import { Request, Response } from "express";
import OrderService from "@services/order.service"; 

class OrderController {
    static async getAllOrders(req: Request, res: Response){
        try {
            const order = await OrderService.getAllOrders();
            const data = {
                message: "Order fetched successfully",
                data: order,
            };
            res.json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Error fetching order" });
        }
    }
    static async getAllOrderDetail(req: Request, res: Response){
        try {
            const order = await OrderService.getAllOrderDetail();
            const data = {
                message: "Order fetched successfully",
                data: order,
            };
            res.json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Error fetching order" });
        }
    }
   static async updateOrder(req: Request, res: Response){
        try {
            const id = req.body.idOrder; // Hoặc parseInt(req.params.id) tùy route
            if(!id) return res.status(400).json({ message: "Thiếu ID đơn hàng" });

            const order = await OrderService.updateOrder(id, req.body);

            if(!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

            return res.status(200).json({
                "cod": 200,
                "message": "Cập nhật thành công",
                "data": order,
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({ message: "Error updating order" });
        }
    }
    static async deleteOrder(req: Request, res: Response){
        try {
            const id = parseInt(req.params.id)
            await OrderService.deleteOrder(id);
            const data = {
                message: "Order deleted successfully",
            };
            res.json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: "Error deleting order" });
        }
    }
  // Lấy thông tin đơn hàng theo ID
//   static async getOrder(req: Request, res: Response) {
//     try {
//       const order = await OrderService.getOrderById(req, res); // Bạn có thể thay đổi nếu bạn muốn lấy order theo ID
//       const data = {
//         message: "Order fetched successfully",
//         data: order,
//       };
//       res.json(data);
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({ message: "Error fetching order" });
//     }
//   }
}

export default OrderController;
