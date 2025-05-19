import { Entity, PrimaryGeneratedColumn, Column, Table, ManyToMany, ManyToOne, OneToMany, CreateDateColumn } from "typeorm"
import Role from "./Role"
import Order from "./Order"
@Entity({ name: "users" })
class Users {
    @PrimaryGeneratedColumn()
    idUser?: number

    @Column()
    UserName?: string

    @Column({
        unique: true,
    })
    Email?: string

    @Column()
    Password?: string

    @Column()
    IsActive?: boolean

    @Column({ nullable: true })
    GoogleId?: string;

    @CreateDateColumn()
    CreatedAt?: Date

    @ManyToOne(() => Role, (Role: Role) => Role.Users)
    Role?: Role;

}

export default Users;
