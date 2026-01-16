import {Entity,PrimaryGeneratedColumn,Column,CreateDateColumn,ManyToOne,JoinColumn} from "typeorm";
import  Product  from "./Products"; 
@Entity({name:"price_histories"})
class PriceHistory {
  @PrimaryGeneratedColumn()
  idPriceHistory?: number;

  @Column("decimal", { precision: 15, scale: 2 }) // Dùng decimal cho tiền tệ để chính xác
  OriginalPrice?: number;

  @Column("decimal", { precision: 15, scale: 2 }) // Dùng decimal cho tiền tệ để chính xác
  SalePrice?: number;

  @Column({ type: "text", nullable: true })
  Reason?: string; // Lý do thay đổi giá (VD: "AI Gợi ý", "Nhập hàng mới", "Sale")

  @CreateDateColumn()
  ChangedAt?: Date; // Thời điểm giá thay đổi

  @ManyToOne(() => Product, (product) => product.PriceHistories, {
    onDelete: "CASCADE" // Nếu xóa sản phẩm -> Xóa luôn lịch sử của nó
  })
  Product?: Product;
}
export default PriceHistory;