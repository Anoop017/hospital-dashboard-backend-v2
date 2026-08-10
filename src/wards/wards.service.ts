import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from './entities/ward.entity';
import { CreateWardDto } from './dto/create-ward.dto';
import { UpdateWardDto } from './dto/update-ward.dto';

@Injectable()
export class WardsService {
  constructor(
    @InjectRepository(Ward)
    private wardsRepository: Repository<Ward>,
  ) {}

  async create(createWardDto: CreateWardDto): Promise<Ward> {
    const existing = await this.wardsRepository.findOne({
      where: { name: createWardDto.name },
    });
    if (existing) {
      throw new ConflictException('Ward with this name already exists');
    }
    const ward = this.wardsRepository.create(createWardDto);
    return this.wardsRepository.save(ward);
  }

  async findAll(): Promise<Ward[]> {
    return this.wardsRepository.find({ relations: { beds: true } });
  }

  async findOne(id: string): Promise<Ward> {
    const ward = await this.wardsRepository.findOne({
      where: { id },
      relations: { beds: true },
    });
    if (!ward) {
      throw new NotFoundException(`Ward with ID ${id} not found`);
    }
    return ward;
  }

  async update(id: string, updateWardDto: UpdateWardDto): Promise<Ward> {
    const ward = await this.findOne(id);
    this.wardsRepository.merge(ward, updateWardDto);
    return this.wardsRepository.save(ward);
  }

  async remove(id: string): Promise<void> {
    const ward = await this.findOne(id);
    await this.wardsRepository.softRemove(ward);
  }
}
