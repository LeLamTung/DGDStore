import { Entity, PrimaryGeneratedColumn, Column, Table, ManyToMany, ManyToOne, OneToMany } from "typeorm"
import Images from "./Images"
import Categories from "./Categories"
import OrderDetail from "./OrderDetail"
import Cart from "./Cart"
@Entity({ name: "products" })
class Products {
    @PrimaryGeneratedColumn()
    idProduct?: number

    @Column()
    ProductName?: string

    @Column()
    ImageName?: string

    @Column()
    Stock?: number

    @Column()
    OriginalPrice?: number

    @Column()
    SalePrice?: number

    @Column()
    SalePercentage?: number

    @Column({ type: 'text', nullable: true })
    Description?: string;

    @Column({ type: 'boolean' })
    IsSales?: boolean;

    @Column({ type: 'boolean' })
    IsHome?: boolean;

    // moi quan hệ với image
    @OneToMany(() => Images, (Images: Images) => Images.Product, { cascade: true, onDelete: "SET NULL" })
    Images?: Images[];
    // moi quan he voi category 
    @ManyToOne(() => Categories, (Category) => Category.Products, { cascade: true, onDelete: "SET NULL", eager: true })
    Category?: Categories;

    @OneToMany(() => OrderDetail, (orderDetail: OrderDetail) => orderDetail.Product)
    OrderDetails?: OrderDetail[];

    @OneToMany(() => Cart, (Cart: Cart) => Cart.Products)
    Cart?: Cart[];
}

export default Products;
