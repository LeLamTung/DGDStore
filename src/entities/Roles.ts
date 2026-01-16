import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import User from "./Users";

@Entity({ name: "roles" })
class Role {
    // SỬA: Map vào cột idrole chữ thường dưới DB
    @PrimaryGeneratedColumn({ name: "idrole" }) 
    idRole?: number;

    // SỬA: Map vào cột namerole chữ thường
    @Column({ name: "namerole" }) 
    NameRole?: string;

    @OneToMany(()=> User,(User:User)=> User.Role)
    Users?: User[];
}
export default Role;