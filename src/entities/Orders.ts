import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import OrderDetail from "./OrderDetail";
import Users from "./Users";

@Entity({ name: "orders" })
class Order {
  @PrimaryGeneratedColumn({ name: "idorder" })
  idOrder?: number;

  @Column({ name: "momoorderid", nullable: true })
  MomoOrderId?: string;

  @Column({ name: "customername" })
  CustomerName?: string;

  @Column({ name: "phonenumber" })
  PhoneNumber?: string;

  @Column({ name: "address" })
  Address?: string;

  @Column({ name: "notes" })
  Notes?: string;

  @Column("decimal", { name: "totalprice" })
  TotalPrice?: number;

  @Column({ name: "paymentmethod" })
  PaymentMethod?: string;

  // @Column({ name: "status" })
  // Status?: number;
  @Column({ name: "order_status", default: 1 })
  OrderStatus?: number; // 1: Pending, 2: Processing, 3: Shipping, 4: Completed, 5: Cancelled

  @Column({ name: "payment_status", default: 0 })
  PaymentStatus?: number; // 0: Unpaid, 1: Paid, 2: Refunded

  @CreateDateColumn({ name: "createdat" })
  CreatedAt?: Date;

  @UpdateDateColumn({ name: "updateat" })
  UpdateAt?: Date;

  @Column({ name: "ghn_order_code", nullable: true })
  GhnOrderCode?: string; // Lưu mã đơn GHN (VD: L8CC20)

  @Column({ name: "district_id", nullable: true })
  DistrictId?: number; // ID Quận/Huyện (Quan trọng để tính ship)

  @Column({ name: "ward_code", nullable: true })
  WardCode?: string; // Mã Phường/Xã (Quan trọng để tính ship)

  @Column("decimal", { name: "shipping_fee", default: 0, precision: 10, scale: 2 })
  ShippingFee?: number; // Lưu riêng tiền ship để thống kê

  @OneToMany(() => OrderDetail, (OrderDetail: OrderDetail) => OrderDetail.Order, {
    cascade: true,
    onDelete: "CASCADE",
  }
  )
  OrderDetail?: OrderDetail[];

  @ManyToOne(() => Users, (Users) => Users.Order, {
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn({ name: "useriduser" }) // Quan trọng
  User?: Users;
}
export default Order;