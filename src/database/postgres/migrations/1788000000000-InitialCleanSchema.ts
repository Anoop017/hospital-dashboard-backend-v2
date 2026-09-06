import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialCleanSchema1788000000000 implements MigrationInterface {
  name = 'InitialCleanSchema1788000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "admin_role_enum" AS ENUM('super_admin', 'admin', 'manager');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "roles_name_enum" AS ENUM('super_admin', 'admin', 'doctor', 'nurse', 'staff', 'patient', 'receptionist', 'pharmacist', 'lab_technician');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "patients_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "patients_bloodgroup_enum" AS ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "admissions_status_enum" AS ENUM('pending', 'admitted', 'observation', 'transferred', 'discharged', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Admins Table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admins" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR NOT NULL UNIQUE,
        "mobile" VARCHAR UNIQUE,
        "passwordHash" VARCHAR NOT NULL,
        "firstName" VARCHAR NOT NULL,
        "lastName" VARCHAR NOT NULL,
        "role" "admin_role_enum" NOT NULL DEFAULT 'admin',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "isLocked" BOOLEAN NOT NULL DEFAULT false,
        "isSystem" BOOLEAN NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "resetPasswordToken" VARCHAR,
        "resetPasswordExpires" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 3. Roles & Permissions Tables
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id" SERIAL PRIMARY KEY,
        "name" "roles_name_enum" NOT NULL UNIQUE,
        "description" VARCHAR,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL,
        "resource" VARCHAR NOT NULL,
        "action" VARCHAR NOT NULL,
        "description" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "role_id" INTEGER NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        "permission_id" INTEGER NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
        PRIMARY KEY ("role_id", "permission_id")
      );
    `);

    // 4. Users Table (Clinical / Portal Users)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "email" VARCHAR NOT NULL UNIQUE,
        "mobile" VARCHAR UNIQUE,
        "passwordHash" VARCHAR NOT NULL,
        "firstName" VARCHAR NOT NULL,
        "lastName" VARCHAR NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "isLocked" BOOLEAN NOT NULL DEFAULT false,
        "isSystem" BOOLEAN NOT NULL DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "resetPasswordToken" VARCHAR,
        "resetPasswordExpires" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        "user_id" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "role_id" INTEGER NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
        PRIMARY KEY ("user_id", "role_id")
      );
    `);

    // 5. Departments & Staff
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "departments" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL UNIQUE,
        "description" TEXT,
        "status" VARCHAR NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "staff" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "departmentId" INTEGER REFERENCES "departments"("id") ON DELETE SET NULL,
        "jobTitle" VARCHAR NOT NULL,
        "hireDate" DATE,
        "status" VARCHAR NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 6. Patients & Clinical Details
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patients" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "dateOfBirth" DATE,
        "gender" "patients_gender_enum",
        "bloodGroup" "patients_bloodgroup_enum",
        "address" TEXT,
        "medicalNotes" TEXT,
        "status" VARCHAR NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "emergency_contacts" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "name" VARCHAR NOT NULL,
        "relationship" VARCHAR NOT NULL,
        "phone" VARCHAR NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patient_allergies" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "allergen" VARCHAR NOT NULL,
        "severity" VARCHAR,
        "reaction" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patient_conditions" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "conditionName" VARCHAR NOT NULL,
        "diagnosedDate" DATE,
        "status" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 7. Doctors
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "doctors" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "specialization" VARCHAR NOT NULL,
        "licenseNumber" VARCHAR NOT NULL UNIQUE,
        "experienceYears" INTEGER NOT NULL DEFAULT 0,
        "consultationFee" NUMERIC(10,2) NOT NULL DEFAULT 0,
        "status" VARCHAR NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 8. Wards & Beds
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "wards" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL UNIQUE,
        "type" VARCHAR NOT NULL,
        "capacity" INTEGER NOT NULL,
        "currentOccupancy" INTEGER NOT NULL DEFAULT 0,
        "floor" VARCHAR NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "beds" (
        "id" SERIAL PRIMARY KEY,
        "wardId" INTEGER NOT NULL REFERENCES "wards"("id") ON DELETE CASCADE,
        "bedNumber" VARCHAR NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'available',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 9. Admissions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "admissions" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "admittingDoctorId" INTEGER REFERENCES "doctors"("id") ON DELETE SET NULL,
        "bedId" INTEGER REFERENCES "beds"("id") ON DELETE SET NULL,
        "admissionDate" TIMESTAMP NOT NULL,
        "dischargeDate" TIMESTAMP,
        "status" "admissions_status_enum" NOT NULL DEFAULT 'admitted',
        "reason" TEXT NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 10. Appointments, Records, Medicines, Prescriptions, Lab Tests
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "appointments" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "doctorId" INTEGER NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE,
        "appointmentDate" TIMESTAMP NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'scheduled',
        "reason" TEXT NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "medical_records" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "doctorId" INTEGER REFERENCES "doctors"("id") ON DELETE SET NULL,
        "diagnosis" VARCHAR NOT NULL,
        "symptoms" TEXT NOT NULL,
        "treatment" TEXT NOT NULL,
        "notes" TEXT,
        "recordDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "medicines" (
        "id" SERIAL PRIMARY KEY,
        "name" VARCHAR NOT NULL UNIQUE,
        "manufacturer" VARCHAR NOT NULL,
        "category" VARCHAR NOT NULL,
        "price" NUMERIC(10,2) NOT NULL,
        "stockQuantity" INTEGER NOT NULL DEFAULT 0,
        "expiryDate" DATE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "prescriptions" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "doctorId" INTEGER NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE,
        "medication" TEXT NOT NULL,
        "dosage" TEXT NOT NULL,
        "frequency" TEXT NOT NULL,
        "duration" TEXT NOT NULL,
        "notes" TEXT,
        "issuedDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "lab_tests" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "doctorId" INTEGER NOT NULL REFERENCES "doctors"("id") ON DELETE CASCADE,
        "testName" VARCHAR NOT NULL,
        "testType" VARCHAR NOT NULL,
        "status" VARCHAR NOT NULL DEFAULT 'pending',
        "result" TEXT,
        "testDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "reportUrl" TEXT,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 11. Bills & Payments
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bills" (
        "id" SERIAL PRIMARY KEY,
        "patientId" INTEGER NOT NULL REFERENCES "patients"("id") ON DELETE CASCADE,
        "admissionId" INTEGER REFERENCES "admissions"("id") ON DELETE SET NULL,
        "appointmentId" INTEGER REFERENCES "appointments"("id") ON DELETE SET NULL,
        "totalAmount" NUMERIC(12,2) NOT NULL,
        "paidAmount" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "status" VARCHAR NOT NULL DEFAULT 'unpaid',
        "dueDate" DATE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" SERIAL PRIMARY KEY,
        "billId" INTEGER NOT NULL REFERENCES "bills"("id") ON DELETE CASCADE,
        "amount" NUMERIC(12,2) NOT NULL,
        "paymentDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "paymentMethod" VARCHAR NOT NULL,
        "referenceNumber" VARCHAR,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 12. Refresh Tokens (Supports both users and admins)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id" SERIAL PRIMARY KEY,
        "token" VARCHAR NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "isRevoked" BOOLEAN NOT NULL DEFAULT false,
        "userId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "adminId" INTEGER REFERENCES "admins"("id") ON DELETE CASCADE,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    // 13. Notifications (Supports both users and admins)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER REFERENCES "users"("id") ON DELETE CASCADE,
        "adminId" INTEGER REFERENCES "admins"("id") ON DELETE CASCADE,
        "title" VARCHAR NOT NULL,
        "message" TEXT NOT NULL,
        "type" VARCHAR NOT NULL DEFAULT 'system',
        "priority" VARCHAR NOT NULL DEFAULT 'info',
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "link" VARCHAR,
        "metadata" JSONB,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notifications_userId_isRead" ON "notifications" ("userId", "isRead");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notifications_userId_createdAt" ON "notifications" ("userId", "createdAt");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notifications_adminId_isRead" ON "notifications" ("adminId", "isRead");`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_notifications_adminId_createdAt" ON "notifications" ("adminId", "createdAt");`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "refresh_tokens" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bills" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "lab_tests" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "prescriptions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medicines" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "medical_records" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "appointments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "beds" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wards" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "doctors" CASCADE;`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "patient_conditions" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "patient_allergies" CASCADE;`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "emergency_contacts" CASCADE;`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "patients" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "staff" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_roles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "role_permissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "permissions" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "roles" CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admins" CASCADE;`);
    await queryRunner.query(`DROP TYPE IF EXISTS "admissions_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "patients_bloodgroup_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "patients_gender_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "roles_name_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "admin_role_enum";`);
  }
}
