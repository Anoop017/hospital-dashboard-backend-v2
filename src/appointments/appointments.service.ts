import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentDto } from './dto/query-appointment.dto';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationPriority, NotificationType } from '../notifications/entities/notification.entity';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const appointment = this.appointmentsRepository.create(createAppointmentDto);
    const saved = await this.appointmentsRepository.save(appointment);

    // Asynchronously dispatch notifications
    this.sendAppointmentCreatedNotifications(saved.id).catch((err) =>
      console.error('Failed to dispatch appointment created notification:', err),
    );

    return saved;
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

  async findMy(userId: number, queryDto?: QueryAppointmentDto): Promise<PageDto<Appointment>> {
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

  async findOne(id: number, userId?: number, roles: string[] = []): Promise<Appointment> {
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

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    const oldStatus = appointment.status;
    this.appointmentsRepository.merge(appointment, updateAppointmentDto);
    const saved = await this.appointmentsRepository.save(appointment);

    if (updateAppointmentDto.status && updateAppointmentDto.status !== oldStatus) {
      this.sendAppointmentStatusUpdatedNotifications(saved.id, updateAppointmentDto.status).catch((err) =>
        console.error('Failed to dispatch status update notification:', err),
      );
    }

    return saved;
  }

  async updateStatus(id: number, status: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = status;
    const saved = await this.appointmentsRepository.save(appointment);

    this.sendAppointmentStatusUpdatedNotifications(saved.id, status).catch((err) =>
      console.error('Failed to dispatch status update notification:', err),
    );

    return saved;
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.softRemove(appointment);
  }

  private async sendAppointmentCreatedNotifications(appointmentId: number): Promise<void> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });

    if (!appointment) return;

    const patientName = appointment.patient?.user
      ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
      : 'Patient';
    const doctorName = appointment.doctor?.user
      ? `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
      : 'Doctor';
    const appDate = new Date(appointment.appointmentDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // Notify Doctor
    if (appointment.doctor?.user?.id) {
      await this.notificationsService.create({
        userId: appointment.doctor.user.id,
        title: 'New Appointment Booked',
        message: `${patientName} has booked an appointment with you for ${appDate}.`,
        type: NotificationType.APPOINTMENT,
        priority: NotificationPriority.INFO,
        link: '/appointments',
        metadata: {
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
        },
      });
    }

    // Notify Admins
    await this.notificationsService.createForAdmins({
      title: 'New Appointment Scheduled',
      message: `Appointment #${appointment.id} booked for ${patientName} with Dr. ${doctorName} on ${appDate}.`,
      type: NotificationType.APPOINTMENT,
      priority: NotificationPriority.INFO,
      link: '/appointments',
      metadata: {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
      },
    });

    // Send Email to Patient
    if (appointment.patient?.user?.email) {
      const portalUrl = this.configService.get<string>('mail.patientPortalUrl') || 'http://localhost:3000';
      this.mailService
        .sendAppointmentCreatedEmail(appointment.patient.user.email, {
          patientName,
          doctorName,
          appointmentDate: appDate,
          status: appointment.status || 'scheduled',
          reason: appointment.reason,
          portalUrl: `${portalUrl}/portal/appointments`,
          appointmentId: appointment.id,
        })
        .catch((err) => console.error('Failed to send appointment created email to patient:', err));
    }

    // Send Email to Doctor
    if (appointment.doctor?.user?.email) {
      const adminUrl = this.configService.get<string>('mail.adminPortalUrl') || 'http://localhost:3001';
      this.mailService
        .sendAppointmentCreatedEmail(appointment.doctor.user.email, {
          patientName,
          doctorName,
          appointmentDate: appDate,
          status: appointment.status || 'scheduled',
          reason: appointment.reason,
          portalUrl: `${adminUrl}/appointments`,
          appointmentId: appointment.id,
        })
        .catch((err) => console.error('Failed to send appointment created email to doctor:', err));
    }
  }

  private async sendAppointmentStatusUpdatedNotifications(
    appointmentId: number,
    newStatus: string,
  ): Promise<void> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: {
        patient: { user: true },
        doctor: { user: true },
      },
    });

    if (!appointment) return;

    const patientName = appointment.patient?.user
      ? `${appointment.patient.user.firstName} ${appointment.patient.user.lastName}`
      : 'Patient';
    const doctorName = appointment.doctor?.user
      ? `${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
      : 'Doctor';
    const appDate = new Date(appointment.appointmentDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    // 1. Notify Patient
    if (appointment.patient?.user?.id) {
      await this.notificationsService.create({
        userId: appointment.patient.user.id,
        title: 'Appointment Status Updated',
        message: `Your appointment with Dr. ${doctorName} on ${appDate} is now marked as "${newStatus}".`,
        type: NotificationType.APPOINTMENT,
        priority: newStatus === 'cancelled' ? NotificationPriority.WARNING : NotificationPriority.INFO,
        link: '/portal/appointments',
        metadata: {
          appointmentId: appointment.id,
          status: newStatus,
        },
      });
    }

    // 2. Notify Doctor
    if (appointment.doctor?.user?.id) {
      await this.notificationsService.create({
        userId: appointment.doctor.user.id,
        title: 'Appointment Status Changed',
        message: `Appointment with ${patientName} on ${appDate} status was updated to "${newStatus}".`,
        type: NotificationType.APPOINTMENT,
        priority: NotificationPriority.INFO,
        link: '/appointments',
        metadata: {
          appointmentId: appointment.id,
          status: newStatus,
        },
      });
    }

    // 3. Notify Admins
    await this.notificationsService.createForAdmins({
      title: 'Appointment Status Changed',
      message: `Appointment #${appointment.id} (${patientName} / Dr. ${doctorName}) is now "${newStatus}".`,
      type: NotificationType.APPOINTMENT,
      priority: NotificationPriority.INFO,
      link: '/appointments',
      metadata: {
        appointmentId: appointment.id,
        status: newStatus,
      },
    });

    // 4. Send Status Update Email to Patient
    if (appointment.patient?.user?.email) {
      const portalUrl = this.configService.get<string>('mail.patientPortalUrl') || 'http://localhost:3000';
      this.mailService
        .sendAppointmentStatusChangedEmail(appointment.patient.user.email, {
          patientName,
          doctorName,
          appointmentDate: appDate,
          status: newStatus,
          reason: appointment.reason,
          portalUrl: `${portalUrl}/portal/appointments`,
          appointmentId: appointment.id,
        })
        .catch((err) => console.error('Failed to send status update email to patient:', err));
    }

    // 5. Send Status Update Email to Doctor
    if (appointment.doctor?.user?.email) {
      const adminUrl = this.configService.get<string>('mail.adminPortalUrl') || 'http://localhost:3001';
      this.mailService
        .sendAppointmentStatusChangedEmail(appointment.doctor.user.email, {
          patientName,
          doctorName,
          appointmentDate: appDate,
          status: newStatus,
          reason: appointment.reason,
          portalUrl: `${adminUrl}/appointments`,
          appointmentId: appointment.id,
        })
        .catch((err) => console.error('Failed to send status update email to doctor:', err));
    }
  }

  async getAvailableSlots(doctorId: number, dateStr: string) {
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
