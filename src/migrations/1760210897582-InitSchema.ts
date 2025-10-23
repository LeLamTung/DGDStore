import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1760210897582 implements MigrationInterface {
    name = 'InitSchema1760210897582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`images\` (\`idImage\` int NOT NULL AUTO_INCREMENT, \`ImageLink\` varchar(255) NOT NULL, \`MainImage\` tinyint NOT NULL, \`productIdProduct\` int NULL, PRIMARY KEY (\`idImage\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`categories\` (\`idCategory\` int NOT NULL AUTO_INCREMENT, \`CategoryName\` varchar(255) NOT NULL, \`CategoryImage\` varchar(255) NOT NULL, PRIMARY KEY (\`idCategory\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`cart\` (\`idCart\` int NOT NULL AUTO_INCREMENT, \`quantity\` int NOT NULL, \`TotalPrice\` int NOT NULL, \`productsIdProduct\` int NULL, \`userIdUser\` int NULL, PRIMARY KEY (\`idCart\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`idProduct\` int NOT NULL AUTO_INCREMENT, \`ProductName\` varchar(255) NOT NULL, \`ImageName\` varchar(255) NOT NULL, \`Stock\` int NOT NULL, \`OriginalPrice\` int NOT NULL, \`SalePrice\` int NOT NULL, \`SalePercentage\` int NOT NULL, \`Description\` text NULL, \`IsSales\` tinyint NOT NULL, \`IsHome\` tinyint NOT NULL, \`categoryIdCategory\` int NULL, PRIMARY KEY (\`idProduct\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`OrderDetail\` (\`idOrderDetail\` int NOT NULL AUTO_INCREMENT, \`ProductName\` varchar(255) NOT NULL, \`ProductImage\` varchar(255) NOT NULL, \`Price\` decimal(10,2) NOT NULL, \`Quantity\` int NOT NULL, \`TotalPrice\` decimal(10,2) NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`orderIdOrder\` int NULL, \`productIdProduct\` int NULL, PRIMARY KEY (\`idOrderDetail\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`idOrder\` int NOT NULL AUTO_INCREMENT, \`CustomerName\` varchar(255) NOT NULL, \`PhoneNumber\` varchar(255) NOT NULL, \`Address\` varchar(255) NOT NULL, \`Notes\` varchar(255) NOT NULL, \`TotalPrice\` decimal NOT NULL, \`PaymentMethod\` varchar(255) NOT NULL, \`Status\` int NOT NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`UpdateAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userIdUser\` int NULL, PRIMARY KEY (\`idOrder\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`idUser\` int NOT NULL AUTO_INCREMENT, \`UserName\` varchar(255) NOT NULL, \`Email\` varchar(255) NOT NULL, \`Password\` varchar(255) NOT NULL, \`IsActive\` tinyint NOT NULL DEFAULT 1, \`GoogleId\` varchar(255) NULL, \`CreatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`roleIdRole\` int NULL, UNIQUE INDEX \`IDX_f73ebcea50dd1c375f20260dbe\` (\`Email\`), PRIMARY KEY (\`idUser\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`idRole\` int NOT NULL AUTO_INCREMENT, \`NameRole\` varchar(255) NOT NULL, PRIMARY KEY (\`idRole\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`images\` ADD CONSTRAINT \`FK_ddda41abe080ce11e3f20276189\` FOREIGN KEY (\`productIdProduct\`) REFERENCES \`products\`(\`idProduct\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart\` ADD CONSTRAINT \`FK_91cb662e2cc27bbf51b290c5474\` FOREIGN KEY (\`productsIdProduct\`) REFERENCES \`products\`(\`idProduct\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`cart\` ADD CONSTRAINT \`FK_bb9c93ff57490d76e2311179c40\` FOREIGN KEY (\`userIdUser\`) REFERENCES \`users\`(\`idUser\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_f7b5d02e5143bd37f35cbfe967b\` FOREIGN KEY (\`categoryIdCategory\`) REFERENCES \`categories\`(\`idCategory\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`OrderDetail\` ADD CONSTRAINT \`FK_ca030ca6d1ea8cb129d45eb4b7c\` FOREIGN KEY (\`orderIdOrder\`) REFERENCES \`orders\`(\`idOrder\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`OrderDetail\` ADD CONSTRAINT \`FK_7a88a38a65001d31008f1cdf815\` FOREIGN KEY (\`productIdProduct\`) REFERENCES \`products\`(\`idProduct\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_3f63520ca0846db747b0575261f\` FOREIGN KEY (\`userIdUser\`) REFERENCES \`users\`(\`idUser\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_4f2beee73b185b2e40c96769372\` FOREIGN KEY (\`roleIdRole\`) REFERENCES \`roles\`(\`idRole\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_4f2beee73b185b2e40c96769372\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_3f63520ca0846db747b0575261f\``);
        await queryRunner.query(`ALTER TABLE \`OrderDetail\` DROP FOREIGN KEY \`FK_7a88a38a65001d31008f1cdf815\``);
        await queryRunner.query(`ALTER TABLE \`OrderDetail\` DROP FOREIGN KEY \`FK_ca030ca6d1ea8cb129d45eb4b7c\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_f7b5d02e5143bd37f35cbfe967b\``);
        await queryRunner.query(`ALTER TABLE \`cart\` DROP FOREIGN KEY \`FK_bb9c93ff57490d76e2311179c40\``);
        await queryRunner.query(`ALTER TABLE \`cart\` DROP FOREIGN KEY \`FK_91cb662e2cc27bbf51b290c5474\``);
        await queryRunner.query(`ALTER TABLE \`images\` DROP FOREIGN KEY \`FK_ddda41abe080ce11e3f20276189\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_f73ebcea50dd1c375f20260dbe\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`OrderDetail\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`cart\``);
        await queryRunner.query(`DROP TABLE \`categories\``);
        await queryRunner.query(`DROP TABLE \`images\``);
    }

}
