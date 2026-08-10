import { MigrationInterface, QueryRunner } from "typeorm";

export class ClinicalModulesSchema1786327742864 implements MigrationInterface {
    name = 'ClinicalModulesSchema1786327742864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "lab_tests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "doctorId" uuid NOT NULL, "testName" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "resultDetails" text, "cost" numeric(10,2) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_400d229da68540bf586c0f4a20f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medicines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "manufacturer" character varying NOT NULL, "unitPrice" numeric(10,2) NOT NULL, "stockQuantity" integer NOT NULL DEFAULT '0', "expiryDate" date, "status" character varying NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_07f8fe9649327c6cffe35c5849b" UNIQUE ("name"), CONSTRAINT "PK_77b93851766f7ab93f71f44b18b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prescriptions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "patientId" uuid NOT NULL, "doctorId" uuid NOT NULL, "appointmentId" uuid, "notes" text, "status" character varying NOT NULL DEFAULT 'pending', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_097b2cc2f2b7e56825468188503" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "prescription_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "prescriptionId" uuid NOT NULL, "medicineId" uuid NOT NULL, "dosage" character varying NOT NULL, "frequency" character varying NOT NULL, "duration" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6216831f49afc381b3934c9672c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."roles_name_enum" ADD VALUE 'pharmacist'`);
        await queryRunner.query(`ALTER TYPE "public"."roles_name_enum" ADD VALUE 'lab_technician'`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD CONSTRAINT "FK_2d56b760dc15282cf14b05c41b0" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lab_tests" ADD CONSTRAINT "FK_0756fd06bf80d3e8e16a1f76d43" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_51f48335657278b20348dde416c" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_42c70415fad4505386e6d7e9dc4" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescriptions" ADD CONSTRAINT "FK_5c22ff49adf67549a85db811a72" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription_items" ADD CONSTRAINT "FK_8f604306272f41c9be46cca4360" FOREIGN KEY ("prescriptionId") REFERENCES "prescriptions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "prescription_items" ADD CONSTRAINT "FK_b89269c7e07f3baa8dbeb99b3f9" FOREIGN KEY ("medicineId") REFERENCES "medicines"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "prescription_items" DROP CONSTRAINT "FK_b89269c7e07f3baa8dbeb99b3f9"`);
        await queryRunner.query(`ALTER TABLE "prescription_items" DROP CONSTRAINT "FK_8f604306272f41c9be46cca4360"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_5c22ff49adf67549a85db811a72"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_42c70415fad4505386e6d7e9dc4"`);
        await queryRunner.query(`ALTER TABLE "prescriptions" DROP CONSTRAINT "FK_51f48335657278b20348dde416c"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP CONSTRAINT "FK_0756fd06bf80d3e8e16a1f76d43"`);
        await queryRunner.query(`ALTER TABLE "lab_tests" DROP CONSTRAINT "FK_2d56b760dc15282cf14b05c41b0"`);
        await queryRunner.query(`CREATE TYPE "public"."roles_name_enum_old" AS ENUM('super_admin', 'admin', 'doctor', 'nurse', 'staff', 'patient', 'receptionist')`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "name" TYPE "public"."roles_name_enum_old" USING "name"::"text"::"public"."roles_name_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."roles_name_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."roles_name_enum_old" RENAME TO "roles_name_enum"`);
        await queryRunner.query(`DROP TABLE "prescription_items"`);
        await queryRunner.query(`DROP TABLE "prescriptions"`);
        await queryRunner.query(`DROP TABLE "medicines"`);
        await queryRunner.query(`DROP TABLE "lab_tests"`);
    }

}
