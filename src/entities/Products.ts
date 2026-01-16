import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from "typeorm"
import Images from "./Images"
import Categories from "./Categories"
import OrderDetail from "./OrderDetail"
import Cart from "./Cart"
import PriceHistory from "./PriceHistories"

@Entity({ name: "products" })
class Products {
    @PrimaryGeneratedColumn({ name: "idproduct" })
    idProduct?: number

    @Column({ name: "productname" })
    ProductName?: string

    @Column({ name: "imagename" })
    ImageName?: string

    @Column({ name: "stock" })
    Stock?: number

    @Column({ name: "originalprice" })
    OriginalPrice?: number

    @Column({ name: "saleprice" })
    SalePrice?: number

    @Column({ name: "salepercentage" })
    SalePercentage?: number

    @Column({ type: 'text', nullable: true, name: "description" })
    Description?: string;

    @Column({ type: 'boolean', name: "issales" })
    IsSales?: boolean;

    @Column({ type: 'boolean', name: "ishome" })
    IsHome?: boolean;

    @OneToMany(() => Images, (Images: Images) => Images.Product, { cascade: true, onDelete: "SET NULL" })
    Images?: Images[];
    
    // Mối quan hệ với category (Bảng này giữ khóa ngoại)
    @ManyToOne(() => Categories, (Category) => Category.Products, { cascade: true, onDelete: "SET NULL", eager: true })
    @JoinColumn({ name: "categoryidcategory" }) // <-- Phải thêm cái này
    Category?: Categories;

    @OneToMany(() => OrderDetail, (orderDetail: OrderDetail) => orderDetail.Product)
    OrderDetails?: OrderDetail[];

    @OneToMany(() => Cart, (Cart: Cart) => Cart.Products)
    Cart?: Cart[];
    
    @OneToMany(() => PriceHistory, (priceHistory) => priceHistory.Product)
    PriceHistories?: PriceHistory[];
}
export default Products;