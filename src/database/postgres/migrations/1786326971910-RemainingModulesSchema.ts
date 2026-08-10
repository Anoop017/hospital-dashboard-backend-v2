import { MigrationInterface, QueryRunner } from "typeorm";

export class RemainingModulesSchema1786326971910 implements MigrationInterface {
    name = 'RemainingModulesSchema1786326971910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "type" character varying NOT NULL, "capacity" integer NOT NULL, "currentOccupancy" integer NOT NULL DEFAULT '0', "floor" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'active', CONSTRAINT "UQ_5a722ad2f076304832fa3d80af5" UNIQUE ("name"), CONSTRAINT "PK_f67afa72e02ac056570c0dde279" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "beds" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "wardId" uuid NOT NULL, "bedNumber" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'available', CONSTRAINT "PK_2212ae7113d85a70dc65983e742" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "patientId" uuid NOT NULL, "admittingDoctorId" uuid, "bedId" uuid, "admissionDate" TIMESTAMP NOT NULL, "dischargeDate" TIMESTAMP, "status" character varying NOT NULL DEFAULT 'admitted', "reason" text NOT NULL, CONSTRAINT "REL_e9eac43b40763c55ca076e4d01" UNIQUE ("bedId"), CONSTRAINT "PK_6d47682a899dfa0a78ce11fe98a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "billId" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "paymentDate" TIMESTAMP NOT NULL DEFAULT now(), "paymentMethod" character varying NOT NULL, "referenceNumber" character varying, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bills" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "patientId" uuid NOT NULL, "admissionId" uuid, "appointmentId" uuid, "totalAmount" numeric(12,2) NOT NULL, "paidAmount" numeric(12,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'unpaid', "dueDate" date, CONSTRAINT "PK_a56215dfcb525755ec832cc80b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "staff" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" uuid NOT NULL, "departmentId" uuid, "jobTitle" character varying NOT NULL, "hireDate" date, "status" character varying NOT NULL DEFAULT 'active', CONSTRAINT "REL_eba76c23bcfc9dad2479b7fd2a" UNIQUE ("userId"), CONSTRAINT "PK_e4ee98bb552756c180aec1e854a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, "description" text, "status" character varying NOT NULL DEFAULT 'active', CONSTRAINT "UQ_8681da666ad9699d568b3e91064" UNIQUE ("name"), CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "medical_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "patientId" uuid NOT NULL, "doctorId" uuid, "appointmentId" uuid, "recordType" character varying NOT NULL, "description" text NOT NULL, "attachments" text, CONSTRAINT "PK_c200c0b76638124b7ed51424823" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "beds" ADD CONSTRAINT "FK_12c4b045ef8d740bb4fe8051429" FOREIGN KEY ("wardId") REFERENCES "wards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_f9d5de8d7dd020123a3c76f0a2e" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_d349ad89076dfc329d7aaa9d45d" FOREIGN KEY ("admittingDoctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admissions" ADD CONSTRAINT "FK_e9eac43b40763c55ca076e4d011" FOREIGN KEY ("bedId") REFERENCES "beds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_566f88b54bf6a0f477b14e8daa5" FOREIGN KEY ("billId") REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bills" ADD CONSTRAINT "FK_7be8e890fd3e005a757fd71d239" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bills" ADD CONSTRAINT "FK_8fed00698b025f91dc315888b3a" FOREIGN KEY ("admissionId") REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bills" ADD CONSTRAINT "FK_d56ac1a3e329bd54022222e0a4f" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "staff" ADD CONSTRAINT "FK_eba76c23bcfc9dad2479b7fd2ad" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "staff" ADD CONSTRAINT "FK_67b6b543fe99f3accd85374f886" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df" FOREIGN KEY ("doctorId") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "medical_records" ADD CONSTRAINT "FK_31bef5f9acc117db52116ee09be" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_31bef5f9acc117db52116ee09be"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_fb2a8c47032fe6f18e9266951df"`);
        await queryRunner.query(`ALTER TABLE "medical_records" DROP CONSTRAINT "FK_7c2c9d4fe663e3330d503bf4407"`);
        await queryRunner.query(`ALTER TABLE "staff" DROP CONSTRAINT "FK_67b6b543fe99f3accd85374f886"`);
        await queryRunner.query(`ALTER TABLE "staff" DROP CONSTRAINT "FK_eba76c23bcfc9dad2479b7fd2ad"`);
        await queryRunner.query(`ALTER TABLE "bills" DROP CONSTRAINT "FK_d56ac1a3e329bd54022222e0a4f"`);
        await queryRunner.query(`ALTER TABLE "bills" DROP CONSTRAINT "FK_8fed00698b025f91dc315888b3a"`);
        await queryRunner.query(`ALTER TABLE "bills" DROP CONSTRAINT "FK_7be8e890fd3e005a757fd71d239"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_566f88b54bf6a0f477b14e8daa5"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_e9eac43b40763c55ca076e4d011"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_d349ad89076dfc329d7aaa9d45d"`);
        await queryRunner.query(`ALTER TABLE "admissions" DROP CONSTRAINT "FK_f9d5de8d7dd020123a3c76f0a2e"`);
        await queryRunner.query(`ALTER TABLE "beds" DROP CONSTRAINT "FK_12c4b045ef8d740bb4fe8051429"`);
        await queryRunner.query(`DROP TABLE "medical_records"`);
        await queryRunner.query(`DROP TABLE "departments"`);
        await queryRunner.query(`DROP TABLE "staff"`);
        await queryRunner.query(`DROP TABLE "bills"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "admissions"`);
        await queryRunner.query(`DROP TABLE "beds"`);
        await queryRunner.query(`DROP TABLE "wards"`);
    }

}
