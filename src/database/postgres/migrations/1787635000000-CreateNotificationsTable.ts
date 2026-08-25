import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateNotificationsTable1787635000000 implements MigrationInterface {
    name = 'CreateNotificationsTable1787635000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "notifications" (
                "id" SERIAL NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                "deletedAt" TIMESTAMP,
                "userId" integer NOT NULL,
                "title" character varying NOT NULL,
                "message" text NOT NULL,
                "type" character varying NOT NULL DEFAULT 'system',
                "priority" character varying NOT NULL DEFAULT 'info',
                "isRead" boolean NOT NULL DEFAULT false,
                "link" character varying,
                "metadata" jsonb,
                CONSTRAINT "PK_notifications_id" PRIMARY KEY ("id"),
                CONSTRAINT "FK_notifications_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_notifications_user_isRead" ON "notifications" ("userId", "isRead")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_notifications_user_createdAt" ON "notifications" ("userId", "createdAt")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user_createdAt"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user_isRead"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
    }
}
