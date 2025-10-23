import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Table,
  ManyToMany,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import Role from "./Role";
import Order from "./Order";
import Cart from "./Cart";
@Entity({ name: "users" })
class Users {
  @PrimaryGeneratedColumn()
  idUser?: number;

  @Column()
  UserName?: string;

  @Column({
    unique: true,
  })
  Email?: string;

  @Column()
  Password?: string;

  @Column({ type: "boolean", default: true })
  IsActive?: boolean;

  @Column({ nullable: true })
  GoogleId?: string;

  @CreateDateColumn()
  CreatedAt?: Date;

  @ManyToOne(() => Role, (Role: Role) => Role.Users)
  Role?: Role;

  @OneToMany(() => Order, (Order: Order) => Order.User)
  Order?: Order[];

  @OneToMany(() => Cart, (Cart: Cart) => Cart.User)
  Cart?: Cart[];
}

export default Users;
