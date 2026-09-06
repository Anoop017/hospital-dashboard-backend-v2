import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
    private readonly configService: ConfigService,
  ) {}

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminsRepository.findOne({
      where: { email: email.trim().toLowerCase() },
    });
  }

  async findByNumber(mobile: string): Promise<Admin | null> {
    return this.adminsRepository.findOne({
      where: { mobile: mobile.trim() },
    });
  }

  async findById(id: number): Promise<Admin> {
    const admin = await this.adminsRepository.findOne({
      where: { id },
    });
    if (!admin) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    return admin;
  }

  async findByResetToken(token: string): Promise<Admin | null> {
    return this.adminsRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async count(options?: any): Promise<number> {
    return this.adminsRepository.count(options as any);
  }

  async save(admin: Admin): Promise<Admin> {
    return this.adminsRepository.save(admin);
  }

  async create(createAdminDto: CreateAdminDto): Promise<Admin> {
    const email = createAdminDto.email.trim().toLowerCase();
    const existingEmail = await this.findByEmail(email);
    if (existingEmail) {
      throw new ConflictException('Email already exists');
    }

    if (createAdminDto.mobile) {
      const existingMobile = await this.findByNumber(createAdminDto.mobile);
      if (existingMobile) {
        throw new ConflictException('Mobile number already exists');
      }
    }

    const saltRounds = parseInt(this.configService.get('BCRYPT_SALT_ROUNDS') || '12', 10);
    const passwordHash = await bcrypt.hash(createAdminDto.password, saltRounds);

    const admin = this.adminsRepository.create({
      ...createAdminDto,
      email,
      passwordHash,
    });

    const saved = await this.adminsRepository.save(admin);
    delete (saved as any).passwordHash;
    return saved;
  }

  async findAll(): Promise<Omit<Admin, 'passwordHash'>[]> {
    const admins = await this.adminsRepository.find({
      order: { createdAt: 'DESC' },
    });
    return admins.map((admin) => {
      delete (admin as any).passwordHash;
      return admin;
    });
  }

  async update(
    id: number,
    updateAdminDto: UpdateAdminDto,
  ): Promise<Omit<Admin, 'passwordHash'>> {
    const admin = await this.findById(id);

    if (
      updateAdminDto.email &&
      updateAdminDto.email.trim().toLowerCase() !== admin.email
    ) {
      const existingEmail = await this.findByEmail(updateAdminDto.email);
      if (existingEmail) throw new ConflictException('Email already exists');
      admin.email = updateAdminDto.email.trim().toLowerCase();
    }

    if (
      updateAdminDto.mobile &&
      updateAdminDto.mobile.trim() !== admin.mobile
    ) {
      const existingMobile = await this.findByNumber(updateAdminDto.mobile);
      if (existingMobile)
        throw new ConflictException('Mobile number already exists');
      admin.mobile = updateAdminDto.mobile.trim();
    }

    if (updateAdminDto.password) {
      const saltRounds = parseInt(
        this.configService.get('BCRYPT_SALT_ROUNDS') || '12',
        10,
      );
      admin.passwordHash = await bcrypt.hash(
        updateAdminDto.password,
        saltRounds,
      );
    }

    if (updateAdminDto.firstName) admin.firstName = updateAdminDto.firstName;
    if (updateAdminDto.lastName) admin.lastName = updateAdminDto.lastName;
    if (updateAdminDto.role) admin.role = updateAdminDto.role;
    if (updateAdminDto.isActive !== undefined)
      admin.isActive = updateAdminDto.isActive;
    if (updateAdminDto.isLocked !== undefined)
      admin.isLocked = updateAdminDto.isLocked;

    const saved = await this.adminsRepository.save(admin);
    delete (saved as any).passwordHash;
    return saved;
  }

  async remove(id: number): Promise<void> {
    const admin = await this.findById(id);
    admin.email = `${admin.email}_deleted_${Date.now()}`;
    if (admin.mobile) {
      admin.mobile = `${admin.mobile}_deleted_${Date.now()}`;
    }
    await this.adminsRepository.save(admin);
    await this.adminsRepository.softRemove(admin);
  }
}
