import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertToIntegerIds1787500000000 implements MigrationInterface {
  name = 'ConvertToIntegerIds1787500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop all tables in public schema except migrations
    await queryRunner.query(`
      DO $$ 
      DECLARE 
        r RECORD;
      BEGIN
        FOR r IN (SELECT table_name FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name != 'migrations') 
        LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.table_name) || ' CASCADE';
        END LOOP;
      END $$;
    `);

    // 2. Create ENUMS if not exists
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'roles_name_enum') THEN
          CREATE TYPE "public"."roles_name_enum" AS ENUM('super_admin', 'admin', 'doctor', 'nurse', 'staff', 'patient', 'receptionist', 'pharmacist', 'lab_technician');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patients_gender_enum') THEN
          CREATE TYPE "public"."patients_gender_enum" AS ENUM('male', 'female', 'other');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patients_bloodgroup_enum') THEN
          CREATE TYPE "public"."patients_bloodgroup_enum" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admissions_status_enum') THEN
          CREATE TYPE "public"."admissions_status_enum" AS ENUM('admitted', 'discharged', 'transferred', 'cancelled');
        END IF;
      END $$;
    `);

    // 3. Create tables with 'id' as the FIRST column

    // USERS
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" SERIAL PRIMARY KEY,
        "email" character varying NOT NULL UNIQUE,
        "mobile" character varying UNIQUE,
        "passwordHash" character varying NOT NULL,
        "firstName" character varying NOT NULL,
        "lastName" character varying NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "isLocked" boolean NOT NULL DEFAULT false,
        "isSystem" boolean NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // ROLES
    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" SERIAL PRIMARY KEY,
        "name" "public"."roles_name_enum" NOT NULL UNIQUE,
        "description" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // PERMISSIONS
    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying NOT NULL,
        "resource" character varying NOT NULL,
        "action" character varying NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // USER_ROLES (Junction)
    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "role_id" integer NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id")
      )
    `);

    // ROLE_PERMISSIONS (Junction)
    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" integer NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "permission_id" integer NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id")
      )
    `);

    // REFRESH_TOKENS
    await queryRunner.query(`
      CREATE TABLE "refresh_tokens" (
        "id" SERIAL PRIMARY KEY,
        "token" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "isRevoked" boolean NOT NULL DEFAULT false,
        "userId" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // DEPARTMENTS
    await queryRunner.query(`
      CREATE TABLE "departments" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying NOT NULL,
        "description" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // WARDS
    await queryRunner.query(`
      CREATE TABLE "wards" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying NOT NULL UNIQUE,
        "type" character varying NOT NULL,
        "capacity" integer NOT NULL,
        "floor" integer,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // BEDS
    await queryRunner.query(`
      CREATE TABLE "beds" (
        "id" SERIAL PRIMARY KEY,
        "wardId" integer NOT NULL REFERENCES "wards"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "bedNumber" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'available',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // PATIENTS
    await queryRunner.query(`
      CREATE TABLE "patients" (
        "id" SERIAL PRIMARY KEY,
        "userId" integer NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "dateOfBirth" date,
        "gender" "public"."patients_gender_enum",
        "bloodGroup" "public"."patients_bloodgroup_enum",
        "address" text,
        "medicalNotes" text,
        "status" character varying NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // EMERGENCY_CONTACTS
    await queryRunner.query(`
      CREATE TABLE "emergency_contacts" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "name" character varying NOT NULL,
        "relationship" character varying NOT NULL,
        "phone" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // PATIENT_ALLERGIES
    await queryRunner.query(`
      CREATE TABLE "patient_allergies" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "allergen" character varying NOT NULL,
        "severity" character varying,
        "reaction" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // PATIENT_CONDITIONS
    await queryRunner.query(`
      CREATE TABLE "patient_conditions" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "conditionName" character varying NOT NULL,
        "diagnosedDate" date,
        "status" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // DOCTORS
    await queryRunner.query(`
      CREATE TABLE "doctors" (
        "id" SERIAL PRIMARY KEY,
        "userId" integer NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "specialization" character varying NOT NULL,
        "licenseNumber" character varying NOT NULL UNIQUE,
        "experienceYears" integer NOT NULL DEFAULT 0,
        "consultationFee" numeric(10,2) NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // STAFF
    await queryRunner.query(`
      CREATE TABLE "staff" (
        "id" SERIAL PRIMARY KEY,
        "userId" integer NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "departmentId" integer REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "jobTitle" character varying NOT NULL,
        "hireDate" date,
        "status" character varying NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // ADMISSIONS
    await queryRunner.query(`
      CREATE TABLE "admissions" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "admittingDoctorId" integer REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "bedId" integer REFERENCES "beds"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "admissionDate" TIMESTAMP NOT NULL,
        "dischargeDate" TIMESTAMP,
        "status" "public"."admissions_status_enum" NOT NULL DEFAULT 'admitted',
        "reason" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // APPOINTMENTS
    await queryRunner.query(`
      CREATE TABLE "appointments" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "doctorId" integer NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "appointmentDate" TIMESTAMP NOT NULL,
        "status" character varying NOT NULL DEFAULT 'scheduled',
        "reason" text NOT NULL,
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // MEDICAL_RECORDS
    await queryRunner.query(`
      CREATE TABLE "medical_records" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "doctorId" integer REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "diagnosis" character varying NOT NULL,
        "symptoms" text NOT NULL,
        "treatment" text NOT NULL,
        "notes" text,
        "recordDate" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // PRESCRIPTIONS
    await queryRunner.query(`
      CREATE TABLE "prescriptions" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "doctorId" integer NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "medication" text NOT NULL,
        "dosage" text NOT NULL,
        "frequency" text NOT NULL,
        "duration" text NOT NULL,
        "notes" text,
        "issuedDate" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // MEDICINES
    await queryRunner.query(`
      CREATE TABLE "medicines" (
        "id" SERIAL PRIMARY KEY,
        "name" character varying NOT NULL UNIQUE,
        "manufacturer" character varying NOT NULL,
        "category" character varying NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "stockQuantity" integer NOT NULL DEFAULT 0,
        "expiryDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // LAB_TESTS
    await queryRunner.query(`
      CREATE TABLE "lab_tests" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "doctorId" integer NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "testName" character varying NOT NULL,
        "testType" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "result" text,
        "reportUrl" text,
        "testDate" TIMESTAMP NOT NULL DEFAULT now(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // BILLS
    await queryRunner.query(`
      CREATE TABLE "bills" (
        "id" SERIAL PRIMARY KEY,
        "patientId" integer NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "admissionId" integer REFERENCES "admissions"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "appointmentId" integer REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE,
        "totalAmount" numeric(12,2) NOT NULL,
        "paidAmount" numeric(12,2) NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'unpaid',
        "dueDate" date,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);

    // PAYMENTS
    await queryRunner.query(`
      CREATE TABLE "payments" (
        "id" SERIAL PRIMARY KEY,
        "billId" integer NOT NULL REFERENCES "bills"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "amount" numeric(12,2) NOT NULL,
        "paymentDate" TIMESTAMP NOT NULL DEFAULT now(),
        "paymentMethod" character varying NOT NULL,
        "referenceNumber" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
