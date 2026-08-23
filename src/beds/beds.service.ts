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

  async findAll(wardId?: string, status?: string): Promise<Bed[]> {
    const qb = this.bedsRepository.createQueryBuilder('bed').leftJoinAndSelect('bed.ward', 'ward');

    if (wardId) {
      qb.andWhere('bed.wardId = :wardId', { wardId });
    }

    if (status) {
      qb.andWhere('bed.status = :status', { status });
    }

    return qb.getMany();
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

  async getAvailabilityMatrix() {
    const beds = await this.bedsRepository.find({ relations: { ward: true } });

    const wardMap = new Map<string, { wardId: string; wardName: string; wardType: string; totalBeds: number; availableBeds: number; occupiedBeds: number; beds: any[] }>();

    beds.forEach((bed) => {
      const wardId = bed.wardId || 'unassigned';
      const wardName = bed.ward?.name || 'Unassigned Ward';
      const wardType = bed.ward?.type || 'General';

      if (!wardMap.has(wardId)) {
        wardMap.set(wardId, {
          wardId,
          wardName,
          wardType,
          totalBeds: 0,
          availableBeds: 0,
          occupiedBeds: 0,
          beds: [],
        });
      }

      const wardData = wardMap.get(wardId)!;
      wardData.totalBeds++;
      if (bed.status === 'available') {
        wardData.availableBeds++;
      } else {
        wardData.occupiedBeds++;
      }

      wardData.beds.push({
        id: bed.id,
        bedNumber: bed.bedNumber,
        status: bed.status,
        updatedAt: bed.updatedAt,
      });
    });

    return Array.from(wardMap.values());
  }
}
