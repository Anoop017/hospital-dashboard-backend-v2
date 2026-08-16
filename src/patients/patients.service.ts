import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

import { UsersService } from '../users/users.service';
import { CreatePatientWithUserDto } from './dto/create-patient-with-user.dto';
import { Role as RoleEnum } from '../common/enums/role.enum';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,
    private usersService: UsersService,
  ) {}

  async createWithUser(dto: CreatePatientWithUserDto): Promise<Patient> {
    dto.user.roles = [RoleEnum.PATIENT];
    const user = await this.usersService.createAdminUser(dto.user);
    const patientData = { ...dto.patient, userId: user.id };
    return this.create(patientData);
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const existing = await this.patientsRepository.findOne({
      where: { userId: createPatientDto.userId },
    });
    if (existing) {
      throw new ConflictException('Patient profile already exists for this user');
    }
    const patient = this.patientsRepository.create(createPatientDto);
    return this.patientsRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find({
      relations: {
        user: true,
        emergencyContacts: true,
        allergies: true,
        conditions: true,
      },
    });
  }

  async findOneByUserId(userId: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { userId },
        relations: {
        user: true,
        emergencyContacts: true,
        allergies: true,
        conditions: true,
      },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with user ID ${userId} not found`);
    }
    return patient;
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
        relations: {
        user: true,
        emergencyContacts: true,
        allergies: true,
        conditions: true,
      },
    });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    this.patientsRepository.merge(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientsRepository.softRemove(patient);
  }
}
