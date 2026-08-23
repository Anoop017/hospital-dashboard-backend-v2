import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';

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

  async findAll(queryDto?: QueryAppointmentDto): Promise<PageDto<Appointment>> {
    const qb = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser');

    if (queryDto?.status) {
      qb.andWhere('appointment.status = :status', { status: queryDto.status });
    }

    if (queryDto?.doctorId) {
      qb.andWhere('appointment.doctorId = :doctorId', { doctorId: queryDto.doctorId });
    }

    if (queryDto?.patientId) {
      qb.andWhere('appointment.patientId = :patientId', { patientId: queryDto.patientId });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(patientUser.firstName) LIKE LOWER(:search) OR LOWER(patientUser.lastName) LIKE LOWER(:search) OR LOWER(doctorUser.firstName) LIKE LOWER(:search) OR LOWER(doctorUser.lastName) LIKE LOWER(:search) OR LOWER(appointment.reason) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    if (queryDto?.startDate && queryDto?.endDate) {
      qb.andWhere('appointment.appointmentDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(queryDto.startDate),
        endDate: new Date(queryDto.endDate),
      });
    } else if (queryDto?.startDate) {
      qb.andWhere('appointment.appointmentDate >= :startDate', { startDate: new Date(queryDto.startDate) });
    } else if (queryDto?.endDate) {
      qb.andWhere('appointment.appointmentDate <= :endDate', { endDate: new Date(queryDto.endDate) });
    }

    const sortField = queryDto?.sortBy === 'appointmentDate' ? 'appointment.appointmentDate' : 'appointment.createdAt';
    const sortOrder = queryDto?.sortOrder || 'DESC';
    qb.orderBy(sortField, sortOrder);

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 10;
    qb.skip(skip).take(take);

    const [appointments, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(appointments, pageMetaDto);
  }

  async findMy(userId: string, queryDto?: QueryAppointmentDto): Promise<PageDto<Appointment>> {
    const qb = this.appointmentsRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('patient.user', 'patientUser')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .leftJoinAndSelect('doctor.user', 'doctorUser')
      .where('(patient.userId = :userId OR doctor.userId = :userId)', { userId });

    if (queryDto?.status) {
      qb.andWhere('appointment.status = :status', { status: queryDto.status });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(doctorUser.firstName) LIKE LOWER(:search) OR LOWER(doctorUser.lastName) LIKE LOWER(:search) OR LOWER(appointment.reason) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    qb.orderBy('appointment.appointmentDate', queryDto?.sortOrder || 'ASC');

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 20;
    qb.skip(skip).take(take);

    const [appointments, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(appointments, pageMetaDto);
  }

  async findOne(id: string, userId?: string, roles: string[] = []): Promise<Appointment> {
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

    // Role-based data ownership verification
    if (roles.includes('patient') && !roles.includes('admin') && !roles.includes('receptionist') && !roles.includes('doctor')) {
      if (appointment.patient?.userId !== userId) {
        throw new ForbiddenException('You are not authorized to view this appointment');
      }
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    this.appointmentsRepository.merge(appointment, updateAppointmentDto);
    return this.appointmentsRepository.save(appointment);
  }

  async updateStatus(id: string, status: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = status;
    return this.appointmentsRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.softRemove(appointment);
  }

  async getAvailableSlots(doctorId: string, dateStr: string) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    const bookedAppointments = await this.appointmentsRepository.find({
      where: {
        doctorId,
        appointmentDate: Between(startOfDay, endOfDay),
        status: Between('scheduled' as any, 'confirmed' as any),
      },
    });

    const bookedTimes = new Set(
      bookedAppointments.map((a) => {
        const d = new Date(a.appointmentDate);
        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      }),
    );

    // Standard hospital clinic time slots from 09:00 to 17:00 (every 30 mins, skipping 13:00-14:00 lunch)
    const allSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30',
    ];

    return allSlots.map((time) => ({
      time,
      isAvailable: !bookedTimes.has(time),
    }));
  }
}
