import { Entity, PrimaryGeneratedColumn, Column, Table, ManyToMany, ManyToOne, OneToMany } from "typeorm"
import Images from "./Images"
import Categories from "./Categories"
import OrderDetail from "./OrderDetail"
@Entity({ name: "products" })
class Products {
    @PrimaryGeneratedColumn()
    idProduct?: number

    @Column()
    ProductName?: string

    @Column()
    ImageName?: string

    @Column()
    OriginalPrice?: number

    @Column()
    SalePrice?: number

    @Column()
    SalePercentage?: number

    @Column({ type: 'text', nullable: true })
    Description?: string;

    @Column({ type: 'boolean' })
    IsSales?: number

    @Column({ type: 'boolean' })
    IsHome?: number

    // moi quan hệ với image
    @OneToMany(() => Images, (Images: Images) => Images.Product, { cascade: true, onDelete: "CASCADE" })
    Images?: Images[];
    // moi quan he voi category 
    @ManyToOne(() => Categories, (Category) => Category.Products, { cascade: true, onDelete: "CASCADE", eager: true })
    Category?: Categories;

    @OneToMany(() => OrderDetail, (orderDetail: OrderDetail) => orderDetail.Product)
    OrderDetails?: OrderDetail[];
}

export default Products;
