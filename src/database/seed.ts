import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { Admin } from '../admins/entities/admin.entity';
import { Role as RoleEnum } from '../common/enums/role.enum';
import { AdminRole } from '../common/enums/admin-role.enum';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as dns from 'node:dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function bootstrap() {
  console.log('Starting seed process...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);
  const configService = app.get(ConfigService);

  const roleRepo = dataSource.getRepository(Role);
  const adminRepo = dataSource.getRepository(Admin);

  console.log('Ensuring clinical and portal roles exist...');
  // Portal & clinical roles for users table
  const portalRoles = [
    RoleEnum.DOCTOR,
    RoleEnum.NURSE,
    RoleEnum.STAFF,
    RoleEnum.PATIENT,
    RoleEnum.RECEPTIONIST,
    RoleEnum.PHARMACIST,
    RoleEnum.LAB_TECHNICIAN,
  ];

  for (const roleName of portalRoles) {
    let role = await roleRepo.findOne({ where: { name: roleName } });
    if (!role) {
      role = roleRepo.create({
        name: roleName,
        description: `${roleName} portal role`,
      });
      await roleRepo.save(role);
      console.log(`Created role: ${roleName}`);
    }
  }

  console.log('Checking for super_admin in admins table...');
  const email = 'admin@hospital.com';
  const password = 'password123';
  let superAdmin = await adminRepo.findOne({ where: { email } });

  if (!superAdmin) {
    const saltRounds = parseInt(
      configService.get('BCRYPT_SALT_ROUNDS') || '12',
      10,
    );
    const passwordHash = await bcrypt.hash(password, saltRounds);

    superAdmin = adminRepo.create({
      email,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      mobile: '+0000000000',
      role: AdminRole.SUPER_ADMIN,
      isSystem: true,
      isActive: true,
    });
    await adminRepo.save(superAdmin);

    console.log('====================================');
    console.log('SUPER ADMIN CREATED IN ADMINS TABLE');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${AdminRole.SUPER_ADMIN}`);
    console.log('====================================');
  } else {
    console.log('Super admin already exists in admins table.');
  }

  await app.close();
  console.log('Seed process completed successfully.');
}

bootstrap().catch((err) => {
  console.error('Seeding failed!', err);
  process.exit(1);
});
