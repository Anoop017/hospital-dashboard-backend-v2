import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPasswordResetToUser1787700000000 implements MigrationInterface {
    name = 'AddPasswordResetToUser1787700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordToken" character varying`);
        await queryRunner.query(`ALTER TABLE "users" ADD "resetPasswordExpires" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordExpires"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "resetPasswordToken"`);
    }
}
