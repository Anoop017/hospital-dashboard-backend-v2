import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from './entities/staff.entity';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

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

  async findOne(id: string): Promise<Staff> {
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

  async update(id: string, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    const staff = await this.findOne(id);
    this.staffRepository.merge(staff, updateStaffDto);
    return this.staffRepository.save(staff);
  }

  async remove(id: string): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.softRemove(staff);
  }
}
