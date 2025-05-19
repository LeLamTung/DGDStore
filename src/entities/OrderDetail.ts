import { Entity, PrimaryGeneratedColumn, Column, Table, ManyToMany, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import Users from "./Users"
import Order from "./Order"
import Products from "./Products"
import ProductService from '@services/product.service';
@Entity({name: "OrderDetail"})
class OrderDetail {
    @PrimaryGeneratedColumn()
    idOrderDetail?: number

    @Column()
    ProductName?: string

    @Column()
    ProductImage?: string

    @Column()
    Price?: number

    @Column()
    Quantity?: number

    @Column("decimal")
    TotalPrice?: number;

    @CreateDateColumn()
    CreatedAt?: Date

    @UpdateDateColumn()
    UpdatedAt?: Date

    //nhieu orderdetail mot order
    @ManyToOne(() => Order,(Order:Order) => Order.OrderDetail,{
        onDelete:'CASCADE',
    })
    Order?: Order;
    // mot orderdetail nhieu san pham
    @ManyToOne(() => Products,(Products:Products) => Products.OrderDetails)
    Product?: Products;
}

export default OrderDetail;
