import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Role } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';
import { Role as RoleEnum } from '../common/enums/role.enum';
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
  const userRepo = dataSource.getRepository(User);

  console.log('Ensuring roles exist...');
  const defaultRoles = Object.values(RoleEnum);
  for (const roleName of defaultRoles) {
    let role = await roleRepo.findOne({ where: { name: roleName as any } });
    if (!role) {
      role = roleRepo.create({ name: roleName as any, description: `${roleName} role` });
      await roleRepo.save(role);
      console.log(`Created role: ${roleName}`);
    }
  }

  console.log('Checking for super_admin user...');
  const email = 'admin@hospital.com';
  const password = 'password123';
  let adminUser = await userRepo.findOne({ where: { email } });

  if (!adminUser) {
    const saltRounds = parseInt(configService.get('BCRYPT_SALT_ROUNDS') || '12', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const superAdminRole = await roleRepo.findOne({ where: { name: RoleEnum.SUPER_ADMIN } });
    
    adminUser = userRepo.create({
      email,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      mobile: '+0000000000', // Added a default mobile since it is required by the users service
      isSystem: true,
      roles: superAdminRole ? [superAdminRole] : [],
    });
    await userRepo.save(adminUser);
    
    console.log('====================================');
    console.log('SUPER ADMIN CREATED SUCCESSFULLY');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('====================================');
  } else {
    console.log('Super admin already exists.');
  }

  await app.close();
  console.log('Seed process completed.');
}

bootstrap().catch(err => {
  console.error('Seeding failed!', err);
  process.exit(1);
});
