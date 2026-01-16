import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm"
import Products from "./Products"

@Entity({name: "images"})
class Images {
    @PrimaryGeneratedColumn({ name: "idimage" })
    idImage?: number

    @Column({ name: "imagelink" })
    ImageLink?: string

    @Column({ name: "mainimage" })
    MainImage?: boolean

    @ManyToOne(() => Products,(Products:Products)=>Products.Images)
    @JoinColumn({ name: "productidproduct" }) // Map vào cột khóa ngoại
    Product?: Products; 
}
export default Images;