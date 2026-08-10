import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn, // <-- Nhớ import thêm cái này
} from "typeorm";
import Role from "./Roles";
import Order from "./Orders";
import Cart from "./Cart";

@Entity({ name: "users" })
class Users {
  // SỬA: iduser
  @PrimaryGeneratedColumn({ name: "iduser" })
  idUser?: number;

  // SỬA: username
  @Column({ name: "username" })
  UserName?: string;

  // SỬA: email
  @Column({ unique: true, name: "email" })
  Email?: string;

  // SỬA: password
  @Column({ name: "password" })
  Password?: string;

  // SỬA: isactive
  @Column({ type: "boolean", default: true, name: "isactive" })
  IsActive?: boolean;

  // SỬA: googleid
  @Column({ nullable: true, name: "googleid" })
  GoogleId?: string;

  // SỬA: createdat
  @CreateDateColumn({ name: "createdat" })
  CreatedAt?: Date;

  @ManyToOne(() => Role, (Role: Role) => Role.Users)
  // SỬA QUAN TRỌNG: Chỉ định rõ tên cột khóa ngoại là roleidrole (chữ thường)
  @JoinColumn({ name: "roleidrole" }) 
  Role?: Role;

  @OneToMany(() => Order, (Order: Order) => Order.User)
  Order?: Order[];

  @OneToMany(() => Cart, (Cart: Cart) => Cart.User)
  Cart?: Cart[];
}

export default Users;