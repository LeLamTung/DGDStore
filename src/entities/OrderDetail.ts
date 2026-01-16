import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import Order from "./Orders";
import Products from "./Products";

@Entity({ name: "orderdetail" }) // Sửa thành chữ thường cho chắc ăn
class OrderDetail {
  @PrimaryGeneratedColumn({ name: "idorderdetail" })
  idOrderDetail?: number;

  @Column({ name: "productname" })
  ProductName?: string;

  @Column({ name: "productimage" })
  ProductImage?: string;

  @Column("decimal", { precision: 10, scale: 2, name: "price" })
  Price?: number;

  @Column({ name: "quantity" })
  Quantity?: number;

  @Column("decimal", { precision: 10, scale: 2, name: "totalprice" })
  TotalPrice?: number;

  @CreateDateColumn({ name: "createdat" })
  CreatedAt?: Date;

  @UpdateDateColumn({ name: "updatedat" })
  UpdatedAt?: Date;

  @ManyToOne(() => Order, (Order: Order) => Order.OrderDetail, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "orderidorder" }) // Map khóa ngoại
  Order?: Order;
  
  @ManyToOne(() => Products, (Products: Products) => Products.OrderDetails,{
    eager: true,
  })
  @JoinColumn({ name: "productidproduct" }) // Map khóa ngoại
  Product?: Products;
}
export default OrderDetail;