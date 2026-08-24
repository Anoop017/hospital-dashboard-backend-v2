import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

import { UsersService } from '../users/users.service';
import { CreateStaffWithUserDto } from './dto/create-staff-with-user.dto';
import { Role as RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private usersService: UsersService,
  ) {}

  async createWithUser(dto: CreateStaffWithUserDto): Promise<Staff> {
    dto.user.roles = [RoleEnum.STAFF];
    const user = await this.usersService.createAdminUser(dto.user);
    const staffData = { ...dto.staff, userId: user.id };
    return this.create(staffData);
  }

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    const existing = await this.staffRepository.findOne({
      where: { userId: createStaffDto.userId },
    });
    if (existing) {
      throw new ConflictException('Staff profile already exists for this user');
    }
    const staff = this.staffRepository.create(createStaffDto);
    return this.staffRepository.save(staff);
  }

  async findAll(): Promise<Staff[]> {
    return this.staffRepository.find({
      relations: {
        user: true,
        department: true,
      },
    });
  }

  async findOneByUserId(userId: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { userId },
      relations: { user: true, department: true },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with user ID ${userId} not found`);
    }
    return staff;
  }

  async findOne(id: number): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: {
        user: true,
        department: true,
      },
    });
    if (!staff) {
      throw new NotFoundException(`Staff with ID ${id} not found`);
    }
    return staff;
  }

  async update(id: number, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);
    this.staffRepository.merge(staff, updateStaffDto);
    return this.staffRepository.save(staff);
  }

  async remove(id: number): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.softRemove(staff);
  }
}
