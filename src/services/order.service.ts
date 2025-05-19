import { AppDataSource } from "@databases/data-source";
import { Request, Response } from "express";
import Order from "@entities/Order";
import OrderDetail from "@entities/OrderDetail";
import Products from "@entities/Products"; // Giả sử bạn có model Product

const OrderDetailRepository = AppDataSource.getRepository(OrderDetail);
const OrderRepository = AppDataSource.getRepository(Order);

class OrderService {
    static async getAllOrders(): Promise<Order[]> {
        const data: any = await OrderRepository.find({
            relations: ["OrderDetail"],
        });
        return data;
    }
    static async getAllOrderDetail(): Promise<OrderDetail[]> {
        const data: any = await OrderDetailRepository.find({
            relations: ["Order", "Product"],
        });
        return data;
    }

    static async updateOrder(req:Request,res:Response): Promise<Order> {
        const id = req.body.idOrder;
        const order = await OrderRepository.findOneBy({idOrder: id});
        if (!order) throw new Error("Không tìm thấy đơn hàng");

        order.CustomerName = req.body.CustomerName || order.CustomerName;
        order.PhoneNumber = req.body.PhoneNumber || order.PhoneNumber;
        order.Address = req.body.Address || order.Address;
        order.Notes = req.body.Notes || order.Notes;
        order.TotalPrice = req.body.TotalPrice || order.TotalPrice;
        order.PaymentMethod = req.body.PaymentMethod || order.PaymentMethod;
        order.Status = req.body.Status || order.Status;
        return await OrderRepository.save(order);
    }
    static async deleteOrder(idOrder: number) {
        const order = await OrderRepository.findOne({
            where: { idOrder },
            relations: ["OrderDetail"], // Đảm bảo có quan hệ với OrderDetail
        });
    
        if (!order) throw new Error("Đơn hàng không tồn tại");
    
        try {
            await OrderRepository.remove(order); // Xóa Order, tất cả OrderDetail sẽ tự động xóa
        } catch (e) {
            console.error("Xóa đơn hàng thất bại:", e);
            throw e;
        }
    
        return order;
    }
      
}
export default OrderService;
