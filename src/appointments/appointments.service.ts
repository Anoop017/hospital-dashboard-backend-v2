import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentsRepository.create(createAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });
  }

  async findMy(userId: string): Promise<Appointment[]> {
    return this.appointmentsRepository.find({
      where: [
        { patient: { userId } },
        { doctor: { userId } }
      ],
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    this.appointmentsRepository.merge(appointment, updateAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.softRemove(appointment);
  }
}
