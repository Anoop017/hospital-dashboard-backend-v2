import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admission } from './entities/admission.entity';
import { CreateAdmissionDto } from './dto/create-admission.dto';
import { UpdateAdmissionDto } from './dto/update-admission.dto';

@Injectable()
export class AdmissionsService {
  constructor(
    @InjectRepository(Admission)
    private admissionsRepository: Repository<Admission>,
  ) {}

  async create(createAdmissionDto: CreateAdmissionDto): Promise<Admission> {
    const admission = this.admissionsRepository.create(createAdmissionDto);
    return this.admissionsRepository.save(admission);
  }

  async findAll(): Promise<Admission[]> {
    return this.admissionsRepository.find({
      relations: {
        patient: { user: true },
        admittingDoctor: { user: true },
        bed: { ward: true },
      },
    });
  }

  async findMy(userId: string): Promise<Admission[]> {
    return this.admissionsRepository.find({
      where: [
        { patient: { userId } },
        { admittingDoctor: { userId } }
      ],
      relations: {
        patient: { user: true },
        admittingDoctor: { user: true },
        bed: { ward: true },
      },
    });
  }

  async findOne(id: string): Promise<Admission> {
    const admission = await this.admissionsRepository.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        admittingDoctor: { user: true },
        bed: { ward: true },
      },
    });
    if (!admission) {
      throw new NotFoundException(`Admission with ID ${id} not found`);
    }
    return admission;
  }

  async update(id: string, updateAdmissionDto: UpdateAdmissionDto): Promise<Admission> {
    const admission = await this.findOne(id);
    this.admissionsRepository.merge(admission, updateAdmissionDto);
    return this.admissionsRepository.save(admission);
  }

  async remove(id: string): Promise<void> {
    const admission = await this.findOne(id);
    await this.admissionsRepository.softRemove(admission);
  }
}
