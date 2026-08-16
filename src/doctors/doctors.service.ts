import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

import { UsersService } from '../users/users.service';
import { CreateDoctorWithUserDto } from './dto/create-doctor-with-user.dto';
import { Role as RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private doctorsRepository: Repository<Doctor>,
    private usersService: UsersService,
  ) {}

  async createWithUser(dto: CreateDoctorWithUserDto): Promise<Doctor> {
    dto.user.roles = [RoleEnum.DOCTOR];
    const user = await this.usersService.createAdminUser(dto.user);
    const doctorData = { ...dto.doctor, userId: user.id };
    return this.create(doctorData);
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const existingUser = await this.doctorsRepository.findOne({
      where: { userId: createDoctorDto.userId },
    });
    if (existingUser) {
      throw new ConflictException('Doctor profile already exists for this user');
    }
    const existingLicense = await this.doctorsRepository.findOne({
      where: { licenseNumber: createDoctorDto.licenseNumber },
    });
    if (existingLicense) {
      throw new ConflictException('License number is already registered');
    }
    
    const doctor = this.doctorsRepository.create(createDoctorDto);
    return this.doctorsRepository.save(doctor);
  }

  async findAll(): Promise<Doctor[]> {
    return this.doctorsRepository.find({ relations: { user: true } });
  }

  async findOneByUserId(userId: string): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with user ID ${userId} not found`);
    }
    return doctor;
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);
    this.doctorsRepository.merge(doctor, updateDoctorDto);
    return this.doctorsRepository.save(doctor);
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.findOne(id);
    doctor.licenseNumber = `${doctor.licenseNumber}_deleted_${Date.now()}`;
    await this.doctorsRepository.save(doctor);
    await this.doctorsRepository.softRemove(doctor);
  }
}
