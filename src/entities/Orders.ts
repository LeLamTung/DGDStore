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

  @Column({ name: "momoorderid" })
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

  @Column({ name: "status" })
  Status?: number;

  @CreateDateColumn({ name: "createdat" })
  CreatedAt?: Date;

  @UpdateDateColumn({ name: "updateat" })
  UpdateAt?: Date;

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