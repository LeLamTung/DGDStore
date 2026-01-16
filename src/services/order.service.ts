import { AppDataSource } from "@databases/data-source";
import { Request, Response } from "express";
import Order from "@entities/Orders";
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

    static async updateOrder(id: number, data: any): Promise<Order | null> {
        const order = await OrderRepository.findOneBy({idOrder: id});
        if (!order) return null; // Trả null để controller xử lý 404

        order.CustomerName = data.CustomerName || order.CustomerName;
        order.PhoneNumber = data.PhoneNumber || order.PhoneNumber;
        order.Address = data.Address || order.Address;
        order.Notes = data.Notes || order.Notes;
        order.TotalPrice = data.TotalPrice || order.TotalPrice;
        order.PaymentMethod = data.PaymentMethod || order.PaymentMethod;
        order.Status = data.Status || order.Status;
        
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
