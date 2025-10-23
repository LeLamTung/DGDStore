import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMomoOrderIdToOrderTable1699999999999 implements MigrationInterface {
  name = 'AddMomoOrderIdToOrderTable1699999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` ADD \`MomoOrderId\` varchar(255) NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`orders\` DROP COLUMN \`momoOrderId\``);
  }
}
