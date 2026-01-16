import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Table,
  ManyToMany,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import Order from "./Order";
import Products from "./Products";
@Entity({ name: "OrderDetail" })
class OrderDetail {
  @PrimaryGeneratedColumn()
  idOrderDetail?: number;

  @Column()
  ProductName?: string;

  @Column()
  ProductImage?: string;

  @Column("decimal", { precision: 10, scale: 2 })
  Price?: number;

  @Column()
  Quantity?: number;

  @Column("decimal", { precision: 10, scale: 2 })
  TotalPrice?: number;

  @CreateDateColumn()
  CreatedAt?: Date;

  @UpdateDateColumn()
  UpdatedAt?: Date;

  //nhieu orderdetail mot order
  @ManyToOne(() => Order, (Order: Order) => Order.OrderDetail, {
    onDelete: "CASCADE",
  })
  Order?: Order;
  // mot orderdetail nhieu san pham
  @ManyToOne(() => Products, (Products: Products) => Products.OrderDetails,{
    eager: true,
  })
  Product?: Products;
}

export default OrderDetail;
