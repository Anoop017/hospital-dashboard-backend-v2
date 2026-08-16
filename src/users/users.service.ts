import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/entities/role.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { In } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private configService: ConfigService,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: { roles: { permissions: true } },
    });
  }
  async findByNumber(number: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { mobile: number },
      relations: { roles: { permissions: true } }
    })
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { roles: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.email) {
      throw new ConflictException('Email is required');
    }
    if (!userData.mobile) {
      throw new ConflictException('Mobile is required')
    }
    const existing = await this.findByEmail(userData.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }
    const numberExisting = await this.findByNumber(userData.mobile);
    if (numberExisting) {
      throw new ConflictException("number already exists")
    }

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findAll(role?: string): Promise<User[]> {
    const queryOptions: any = {
      relations: { roles: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mobile: true,
        isActive: true,
        isLocked: true,
        createdAt: true,
      }
    };

    if (role) {
      // If they explicitly ask for staff, include nurses as well. Otherwise support comma-separated roles.
      const rolesToSearch = role === 'staff' ? ['staff', 'nurse'] : role.split(',');
      queryOptions.where = {
        roles: {
          name: In(rolesToSearch)
        }
      };
    }

    return this.usersRepository.find(queryOptions);
  }

  async findAllSummary(): Promise<{ total: number; active: number; locked: number; admins: number }> {
    const users = await this.usersRepository.find({
      relations: { roles: true },
      select: {
        id: true,
        isActive: true,
        isLocked: true,
        roles: { name: true }
      }
    });

    return {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      locked: users.filter(u => u.isLocked).length,
      admins: users.filter(u => u.roles?.some(r => r.name === 'admin' || r.name === 'super_admin')).length
    };
  }

  async createAdminUser(createUserDto: CreateUserDto): Promise<User> {
    const { password, roles, ...userData } = createUserDto;

    const existingEmail = await this.findByEmail(userData.email);
    if (existingEmail) throw new ConflictException('Email already exists');
    
    const existingMobile = await this.findByNumber(userData.mobile);
    if (existingMobile) throw new ConflictException('Mobile number already exists');

    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS') || '12', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let assignedRoles: Role[] = [];
    if (roles && roles.length > 0) {
      assignedRoles = await this.roleRepository.find({
        where: { name: In(roles) }
      });
    }

    const user = this.usersRepository.create({
      ...userData,
      passwordHash,
      roles: assignedRoles,
    });

    const savedUser = await this.usersRepository.save(user);
    const { passwordHash: _, ...result } = savedUser;
    return result as User;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    const { roles, ...updateData } = updateUserDto;

    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await this.findByEmail(updateData.email);
      if (existingEmail) throw new ConflictException('Email already exists');
    }

    if (updateData.mobile && updateData.mobile !== user.mobile) {
      const existingMobile = await this.findByNumber(updateData.mobile);
      if (existingMobile) throw new ConflictException('Mobile number already exists');
    }

    Object.assign(user, updateData);

    if (roles !== undefined) {
      if (roles.length > 0) {
        user.roles = await this.roleRepository.find({
          where: { name: In(roles) }
        });
      } else {
        user.roles = [];
      }
    }

    const savedUser = await this.usersRepository.save(user);
    const { passwordHash: _, ...result } = savedUser;
    return result as User;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    user.email = `${user.email}_deleted_${Date.now()}`;
    if (user.mobile) {
      user.mobile = `${user.mobile}_deleted_${Date.now()}`;
    }
    await this.usersRepository.save(user);
    await this.usersRepository.softRemove(user);
  }
}
