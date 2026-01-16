import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPriceHistoryTable1768321712081 implements MigrationInterface {
    name = 'AddPriceHistoryTable1768321712081'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. XÓA HOẶC COMMENT DÒNG NÀY (Vì bảng đã có rồi)
    // await queryRunner.query(`CREATE TABLE \`OrderDetail\` ...`);

    // 2. GIỮ NGUYÊN DÒNG NÀY (Đây là cái bạn cần)
    await queryRunner.query(`CREATE TABLE \`price_histories\` (\`idPriceHistory\` int NOT NULL AUTO_INCREMENT, \`Price\` decimal(15,2) NOT NULL, \`Reason\` text NULL, \`ChangedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`productIdProduct\` int NULL, PRIMARY KEY (\`idPriceHistory\`)) ENGINE=InnoDB`);

    // 3. KIỂM TRA DÒNG NÀY (Bảng orders của bạn đã cập nhật MomoOrderId chưa?)
    // Nếu bảng orders cột MomoOrderId đang cho phép null mà bạn muốn bắt buộc có dữ liệu -> Giữ lại.
    // Nếu bảng orders đã đúng ý bạn rồi -> Xóa dòng này đi.
    // await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`MomoOrderId\` \`MomoOrderId\` varchar(255) NOT NULL`);

    // 4. XÓA DÒNG NÀY (Nếu bảng OrderDetail cũ đã có khóa ngoại rồi)
    // await queryRunner.query(`ALTER TABLE \`OrderDetail\` ADD CONSTRAINT \`FK_ca030ca6d1ea8cb129d45eb4b7c\` ...`);
    // await queryRunner.query(`ALTER TABLE \`OrderDetail\` ADD CONSTRAINT \`FK_7a88a38a65001d31008f1cdf815\` ...`);

    // 5. GIỮ NGUYÊN DÒNG NÀY (Khóa ngoại cho bảng mới)
    await queryRunner.query(`ALTER TABLE \`price_histories\` ADD CONSTRAINT \`FK_383e701e93430f882167f42ff0e\` FOREIGN KEY (\`productIdProduct\`) REFERENCES \`products\`(\`idProduct\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
}

    public async down(queryRunner: QueryRunner): Promise<void> {
     // GIỮ: Xóa khóa ngoại bảng mới
    await queryRunner.query(`ALTER TABLE \`price_histories\` DROP FOREIGN KEY \`FK_383e701e93430f882167f42ff0e\``);
    
    // XÓA: Không đụng vào OrderDetail cũ
    // await queryRunner.query(`ALTER TABLE \`OrderDetail\` DROP FOREIGN KEY \`FK_7a88a38a65001d31008f1cdf815\``);
    // await queryRunner.query(`ALTER TABLE \`OrderDetail\` DROP FOREIGN KEY \`FK_ca030ca6d1ea8cb129d45eb4b7c\``);

    // KIỂM TRA: Revert lại cột orders (tùy vào bước up)
    // await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`MomoOrderId\` \`MomoOrderId\` varchar(255) NULL`);

    // GIỮ: Xóa bảng mới
    await queryRunner.query(`DROP TABLE \`price_histories\``);

    // XÓA NGAY: Tuyệt đối không được để dòng này, nếu revert sẽ mất sạch data cũ
    // await queryRunner.query(`DROP TABLE \`OrderDetail\``);
}

}
