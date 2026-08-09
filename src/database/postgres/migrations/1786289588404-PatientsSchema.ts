import { MigrationInterface, QueryRunner } from "typeorm";

export class PatientsSchema1786289588404 implements MigrationInterface {
    name = 'PatientsSchema1786289588404'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "patient_allergies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "patientId" uuid NOT NULL, "allergen" character varying NOT NULL, "severity" character varying, "reaction" character varying, CONSTRAINT "PK_3ad7c82be25564a47df337045f8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_conditions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "patientId" uuid NOT NULL, "conditionName" character varying NOT NULL, "diagnosedDate" date, "status" character varying, CONSTRAINT "PK_b092a977f5c88d6eb9f93985b77" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."patients_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."patients_bloodgroup_enum" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')`);
        await queryRunner.query(`CREATE TABLE "patients" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "dateOfBirth" date, "gender" "public"."patients_gender_enum", "bloodGroup" "public"."patients_bloodgroup_enum", "address" text, "medicalNotes" text, "status" character varying NOT NULL DEFAULT 'active', CONSTRAINT "REL_2c24c3490a26d04b0d70f92057" UNIQUE ("userId"), CONSTRAINT "PK_a7f0b9fcbb3469d5ec0b0aceaa7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "emergency_contacts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "patientId" uuid NOT NULL, "name" character varying NOT NULL, "relationship" character varying NOT NULL, "phone" character varying NOT NULL, CONSTRAINT "PK_8be191845b6fca1c4e5ba5bd7d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "patient_allergies" ADD CONSTRAINT "FK_6f475d246eec23c35096beb4883" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_conditions" ADD CONSTRAINT "FK_5a6aca46c506997ee2e08568685" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patients" ADD CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "emergency_contacts" ADD CONSTRAINT "FK_093a4f871d059882bbf77fc42f7" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "emergency_contacts" DROP CONSTRAINT "FK_093a4f871d059882bbf77fc42f7"`);
        await queryRunner.query(`ALTER TABLE "patients" DROP CONSTRAINT "FK_2c24c3490a26d04b0d70f92057a"`);
        await queryRunner.query(`ALTER TABLE "patient_conditions" DROP CONSTRAINT "FK_5a6aca46c506997ee2e08568685"`);
        await queryRunner.query(`ALTER TABLE "patient_allergies" DROP CONSTRAINT "FK_6f475d246eec23c35096beb4883"`);
        await queryRunner.query(`DROP TABLE "emergency_contacts"`);
        await queryRunner.query(`DROP TABLE "patients"`);
        await queryRunner.query(`DROP TYPE "public"."patients_bloodgroup_enum"`);
        await queryRunner.query(`DROP TYPE "public"."patients_gender_enum"`);
        await queryRunner.query(`DROP TABLE "patient_conditions"`);
        await queryRunner.query(`DROP TABLE "patient_allergies"`);
    }

}
