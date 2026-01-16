import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTablePriceHistory1768323657571 implements MigrationInterface {
    name = 'AlterTablePriceHistory1768323657571'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`CREATE TABLE \`OrderDetail\` (\`idOrderDetail\` int NOT NULL AUTO_INCREMENT, \`ProductName\` varchar(255) NOT NULL, \`ProductImage\` varchar(255) NOT NULL, \`Price\` decimal(10,2) NOT NULL, \`Quantity\` int NOT NULL, \`TotalPrice\` decimal(10,2) NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`orderIdOrder\` int NULL, \`productIdProduct\` int NULL, PRIMARY KEY (\`idOrderDetail\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`price_histories\` DROP COLUMN \`Price\``);
        await queryRunner.query(`ALTER TABLE \`price_histories\` ADD \`OriginalPrice\` decimal(15,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`price_histories\` ADD \`SalePrice\` decimal(15,2) NOT NULL`);
    //     await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`MomoOrderId\` \`MomoOrderId\` varchar(255) NOT NULL`);
    //     await queryRunner.query(`ALTER TABLE \`OrderDetail\` ADD CONSTRAINT \`FK_ca030ca6d1ea8cb129d45eb4b7c\` FOREIGN KEY (\`orderIdOrder\`) REFERENCES \`orders\`(\`idOrder\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    //     await queryRunner.query(`ALTER TABLE \`OrderDetail\` ADD CONSTRAINT \`FK_7a88a38a65001d31008f1cdf815\` FOREIGN KEY (\`productIdProduct\`) REFERENCES \`products\`(\`idProduct\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
     }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE \`OrderDetail\` DROP FOREIGN KEY \`FK_7a88a38a65001d31008f1cdf815\``);
        // await queryRunner.query(`ALTER TABLE \`OrderDetail\` DROP FOREIGN KEY \`FK_ca030ca6d1ea8cb129d45eb4b7c\``);
        // await queryRunner.query(`ALTER TABLE \`orders\` CHANGE \`MomoOrderId\` \`MomoOrderId\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`price_histories\` DROP COLUMN \`SalePrice\``);
        await queryRunner.query(`ALTER TABLE \`price_histories\` DROP COLUMN \`OriginalPrice\``);
        await queryRunner.query(`ALTER TABLE \`price_histories\` ADD \`Price\` decimal(15,2) NOT NULL`);
        // await queryRunner.query(`DROP TABLE \`OrderDetail\``);
    }

}
