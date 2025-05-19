import { Entity, PrimaryGeneratedColumn, Column, Table, ManyToMany, ManyToOne, OneToMany } from "typeorm"
import Products from "./Products"
@Entity({name: "categories"})
class Categories {
    @PrimaryGeneratedColumn()
    idCategory?: number

    @Column()
    CategoryName?: string

    @Column()
    CategoryImage?: string

    @OneToMany(() => Products,(products:Products)=>products.Category)
    Products?: Products[];
}

export default Categories;
