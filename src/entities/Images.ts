import { Entity, PrimaryGeneratedColumn, Column, Table, ManyToMany, ManyToOne } from "typeorm"
import Products from "./Products"
@Entity({name: "images"})
class Images {
    @PrimaryGeneratedColumn()
    idImage?: number

    @Column()
    ImageLink?: string

    @Column()
    MainImage?: boolean

    @ManyToOne(() => Products,(Products:Products)=>Products.Images)
    Product?: Products; 
}

export default Images;
