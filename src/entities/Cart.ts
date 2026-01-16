import User from "./Users";
import Products from "./Products";
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from "typeorm"

@Entity({ name: "cart" }) // Tên bảng
class Cart {
    @PrimaryGeneratedColumn({ name: "idcart" })
    idCart?: number

    @Column({ name: "quantity" })
    quantity?: number

    @Column({ name: "totalprice" })
    TotalPrice?: number

    @ManyToOne(() => Products, (Products: Products) => Products.Cart,{onDelete: "SET NULL",eager: true})
    @JoinColumn({ name: "productsidproduct" }) // Kiểm tra DB xem cột này tên gì
    Products?: Products;

    @ManyToOne(() => User, (User: User) => User.Cart,{ onDelete:"CASCADE", eager: true })
    @JoinColumn({ name: "useriduser" }) // Kiểm tra DB xem cột này tên gì
    User?: User;
}
export default Cart;