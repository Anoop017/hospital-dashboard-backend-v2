import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed } from './entities/bed.entity';
import { CreateBedDto } from './dto/create-bed.dto';
import { UpdateBedDto } from './dto/update-bed.dto';

@Injectable()
export class BedsService {
  constructor(
    @InjectRepository(Bed)
    private bedsRepository: Repository<Bed>,
  ) {}

  async create(createBedDto: CreateBedDto): Promise<Bed> {
    const existing = await this.bedsRepository.findOne({
      where: { wardId: createBedDto.wardId, bedNumber: createBedDto.bedNumber },
    });
    if (existing) {
      throw new ConflictException('Bed number already exists in this ward');
    }
    const bed = this.bedsRepository.create(createBedDto);
    return this.bedsRepository.save(bed);
  }

  async findAll(): Promise<Bed[]> {
    return this.bedsRepository.find({ relations: { ward: true } });
  }

  async findOne(id: string): Promise<Bed> {
    const bed = await this.bedsRepository.findOne({
      where: { id },
      relations: { ward: true },
    });
    if (!bed) {
      throw new NotFoundException(`Bed with ID ${id} not found`);
    }
    return bed;
  }

  async update(id: string, updateBedDto: UpdateBedDto): Promise<Bed> {
    const bed = await this.findOne(id);
    this.bedsRepository.merge(bed, updateBedDto);
    return this.bedsRepository.save(bed);
  }

  async remove(id: string): Promise<void> {
    const bed = await this.findOne(id);
    await this.bedsRepository.softRemove(bed);
  }
}
