import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LabTest } from './entities/lab-test.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LaboratoryService {
  constructor(
    @InjectRepository(LabTest)
    private readonly labTestsRepository: Repository<LabTest>,
  ) {}

  async create(createLabTestDto: CreateLabTestDto): Promise<LabTest> {
    const labTest = this.labTestsRepository.create(createLabTestDto);
    return this.labTestsRepository.save(labTest);
  }

  async findAll(): Promise<LabTest[]> {
    return this.labTestsRepository.find({
      relations: { patient: true, doctor: true }
    });
  }

  async findMy(userId: string): Promise<LabTest[]> {
    return this.labTestsRepository.find({
      where: [
        { patient: { userId } },
        { doctor: { userId } }
      ],
      relations: { patient: { user: true }, doctor: { user: true } }
    });
  }

  async findOne(id: string): Promise<LabTest> {
    const labTest = await this.labTestsRepository.findOne({ 
      where: { id },
      relations: { patient: true, doctor: true }
    });
    if (!labTest) {
      throw new NotFoundException(`Lab test with ID ${id} not found`);
    }
    return labTest;
  }

  async update(id: string, updateLabTestDto: UpdateLabTestDto): Promise<LabTest> {
    const labTest = await this.findOne(id);
    Object.assign(labTest, updateLabTestDto);
    return this.labTestsRepository.save(labTest);
  }

  async remove(id: string): Promise<void> {
    const labTest = await this.findOne(id);
    await this.labTestsRepository.softRemove(labTest);
  }
}
