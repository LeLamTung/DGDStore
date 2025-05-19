import { Entity, PrimaryGeneratedColumn, Column, Table, OneToMany } from "typeorm"
import User from "./Users";

@Entity({ name: "roles" })
class Role {
    @PrimaryGeneratedColumn()
    idRole?: number;

    @Column()
    NameRole?: string;

    @OneToMany(()=> User,(User:User)=> User.Role)
    Users?: User[];
}
export default Role;
