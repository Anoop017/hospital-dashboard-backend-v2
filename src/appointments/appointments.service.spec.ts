import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from './appointments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { MockRepository } from '../common/test-utils/mock-repository';
import { NotFoundException } from '@nestjs/common';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
  let mockRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: getRepositoryToken(Appointment), useClass: MockRepository },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    mockRepo = module.get(getRepositoryToken(Appointment));
  });

  it('should create an appointment', async () => {
    mockRepo.save.mockResolvedValue({ id: '1' });
    const result = await service.create({ patientId: 'p1', doctorId: 'd1', appointmentDate: new Date().toISOString(), reason: 'Checkup' });
    expect(result).toEqual({ id: '1' });
  });

  it('should find one appointment', async () => {
    mockRepo.findOne.mockResolvedValue({ id: '1' });
    const result = await service.findOne('1');
    expect(result).toEqual({ id: '1' });
  });

  it('should throw NotFoundException if appointment not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
  });
});
