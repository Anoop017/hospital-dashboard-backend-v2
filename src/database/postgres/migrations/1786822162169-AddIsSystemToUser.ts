import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsSystemToUser1786822162169 implements MigrationInterface {
    name = 'AddIsSystemToUser1786822162169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isSystem" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isSystem"`);
    }

}
