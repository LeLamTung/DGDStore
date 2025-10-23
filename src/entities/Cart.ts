import User from "./Users";
import Products from "./Products";
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm"
@Entity({ name: "cart" })
class Cart {
    @PrimaryGeneratedColumn()
    idCart?: number

    @Column()
    quantity?: number

    @Column()
    TotalPrice?: number

    @ManyToOne(() => Products, (Products: Products) => Products.Cart,{onDelete: "SET NULL",eager: true})
    Products?: Products;

    @ManyToOne(() => User, (User: User) => User.Cart,{ onDelete:"CASCADE", eager: true })
    User?: User;

}
export default Cart;