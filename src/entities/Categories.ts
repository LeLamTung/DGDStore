import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import Products from "./Products"

@Entity({name: "categories"})
class Categories {
    @PrimaryGeneratedColumn({ name: "idcategory" })
    idCategory?: number

    @Column({ name: "categoryname" })
    CategoryName?: string

    @Column({ name: "categoryimage" })
    CategoryImage?: string

    @OneToMany(() => Products,(products:Products)=>products.Category)
    Products?: Products[];
}
export default Categories;