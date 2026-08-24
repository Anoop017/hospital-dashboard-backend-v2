import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { UpdateMedicineDto } from './dto/update-medicine.dto';
import { QueryMedicineDto } from './dto/query-medicine.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Medicine } from './entities/medicine.entity';
import { Repository, LessThanOrEqual } from 'typeorm';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';

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

  async findAll(queryDto?: QueryMedicineDto): Promise<PageDto<Medicine>> {
    const qb = this.medicinesRepository.createQueryBuilder('medicine');

    if (queryDto?.category) {
      qb.andWhere('LOWER(medicine.category) = LOWER(:category)', { category: queryDto.category });
    }

    if (queryDto?.lowStock) {
      qb.andWhere('medicine.stockQuantity <= 20');
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(medicine.name) LIKE LOWER(:search) OR LOWER(medicine.manufacturer) LIKE LOWER(:search) OR LOWER(medicine.category) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    qb.orderBy('medicine.name', queryDto?.sortOrder === 'DESC' ? 'DESC' : 'ASC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 10;
    qb.skip(skip).take(take);

    const [medicines, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(medicines, pageMetaDto);
  }

  async findOne(id: number): Promise<Medicine> {
    const medicine = await this.medicinesRepository.findOne({ where: { id } });
    if (!medicine) {
      throw new NotFoundException(`Medicine with ID ${id} not found`);
    }
    return medicine;
  }

  async update(id: number, updateMedicineDto: UpdateMedicineDto): Promise<Medicine> {
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

  async remove(id: number): Promise<void> {
    const medicine = await this.findOne(id);
    medicine.name = `${medicine.name}_deleted_${Date.now()}`;
    await this.medicinesRepository.save(medicine);
    await this.medicinesRepository.softRemove(medicine);
  }

  async getInventoryStats() {
    const total = await this.medicinesRepository.count();
    const lowStock = await this.medicinesRepository.count({ where: { stockQuantity: LessThanOrEqual(20) } });
    const outOfStock = await this.medicinesRepository.count({ where: { stockQuantity: 0 } });

    return {
      totalMedicines: total,
      lowStockCount: lowStock,
      outOfStockCount: outOfStock,
    };
  }
}
