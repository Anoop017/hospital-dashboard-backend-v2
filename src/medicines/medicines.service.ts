import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MedicinesService {
  constructor(
    @InjectRepository(Medicine)
    private readonly medicinesRepository: Repository<Medicine>,
  ) {}

  async create(createMedicineDto: CreateMedicineDto): Promise<Medicine> {
    const existing = await this.medicinesRepository.findOne({ where: { name: createMedicineDto.name } });
    if (existing) {
      throw new ConflictException('Medicine with this name already exists');
    }
    const medicine = this.medicinesRepository.create(createMedicineDto);
    return this.medicinesRepository.save(medicine);
  }

  async findAll(): Promise<Medicine[]> {
    return this.medicinesRepository.find();
  }

  async findOne(id: string): Promise<Medicine> {
    const medicine = await this.medicinesRepository.findOne({ where: { id } });
    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }
    return medicine;
  }

  async update(id: string, updateMedicineDto: UpdateMedicineDto): Promise<Medicine> {
    const medicine = await this.findOne(id);
    
    if (updateMedicineDto.name && updateMedicineDto.name !== medicine.name) {
      const existing = await this.medicinesRepository.findOne({ where: { name: updateMedicineDto.name } });
      if (existing) {
        throw new ConflictException('Medicine with this name already exists');
      }
    }

    Object.assign(medicine, updateMedicineDto);
    return this.medicinesRepository.save(medicine);
  }

  async remove(id: string): Promise<void> {
    const medicine = await this.findOne(id);
    await this.medicinesRepository.softRemove(medicine);
  }
}
