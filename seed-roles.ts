import dataSource from './src/database/postgres/data-source';
import { Role as RoleEnum } from './src/common/enums/role.enum';
import { Role } from './src/roles/entities/role.entity';

async function seed() {
  await dataSource.initialize();
  const roleRepo = dataSource.getRepository(Role);
  
  for (const roleName of Object.values(RoleEnum)) {
    let role = await roleRepo.findOne({ where: { name: roleName } });
    if (!role) {
      role = roleRepo.create({ name: roleName, description: `${roleName} role` });
      await roleRepo.save(role);
      console.log(`Created role: ${roleName}`);
    } else {
      console.log(`Role ${roleName} already exists`);
    }
  }
  
  // Assign all roles to admin@hospital.com (if they exist) so they can test everything
  await dataSource.query(`
    INSERT INTO user_roles (user_id, role_id) 
    SELECT u.id, r.id FROM users u, roles r 
    WHERE u.email = 'admin@hospital.com'
    ON CONFLICT DO NOTHING
  `);
  console.log('Assigned all roles to admin@hospital.com');
  
  await dataSource.destroy();
}

seed().catch(console.error);
