import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,ManyToOne,JoinColumn} from "typeorm";
import  Product  from "./Products"; 

@Entity({name:"price_histories"})
class PriceHistory {
  @PrimaryGeneratedColumn({ name: "idpricehistory" })
  idPriceHistory?: number;

  @Column("decimal", { precision: 15, scale: 2, name: "originalprice" }) 
  OriginalPrice?: number;

  @Column("decimal", { precision: 15, scale: 2, name: "saleprice" }) 
  SalePrice?: number;

  @Column({ type: "text", nullable: true, name: "reason" })
  Reason?: string; 

  @CreateDateColumn({ name: "changedat" })
  ChangedAt?: Date; 

  @ManyToOne(() => Product, (product) => product.PriceHistories, {
    onDelete: "CASCADE" 
  })
  @JoinColumn({ name: "productidproduct" }) // Map khóa ngoại
  Product?: Product;
}
export default PriceHistory;