import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';
import { User } from '../users/entities/user.entity';
import { Admin } from '../admins/entities/admin.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create(
      createNotificationDto,
    );
    return this.notificationsRepository.save(notification);
  }

  async createForUsers(
    userIds: number[],
    data: Omit<CreateNotificationDto, 'userId'>,
  ): Promise<Notification[]> {
    if (!userIds || userIds.length === 0) return [];

    const uniqueUserIds = Array.from(new Set(userIds));
    const notifications = uniqueUserIds.map((userId) =>
      this.notificationsRepository.create({
        ...data,
        userId,
      }),
    );
    return this.notificationsRepository.save(notifications);
  }

  async createForAdmins(
    data: Omit<CreateNotificationDto, 'userId'>,
  ): Promise<Notification[]> {
    try {
      const activeAdmins = await this.adminsRepository.find({
        where: { isActive: true },
      });

      const notifications = activeAdmins.map((admin) =>
        this.notificationsRepository.create({
          ...data,
          adminId: admin.id,
        }),
      );
      return this.notificationsRepository.save(notifications);
    } catch (error) {
      console.error('Failed to notify admins:', error);
      return [];
    }
  }

  async findMyNotifications(
    recipientId: number,
    queryDto?: QueryNotificationDto,
    userType: string = 'user',
  ): Promise<PageDto<Notification>> {
    const qb = this.notificationsRepository.createQueryBuilder('notification');

    if (userType === 'admin') {
      qb.where('notification.adminId = :recipientId', { recipientId });
    } else {
      qb.where('notification.userId = :recipientId', { recipientId });
    }

    if (queryDto?.isRead !== undefined) {
      qb.andWhere('notification.isRead = :isRead', { isRead: queryDto.isRead });
    }

    if (queryDto?.type) {
      qb.andWhere('notification.type = :type', { type: queryDto.type });
    }

    if (queryDto?.search) {
      qb.andWhere(
        '(LOWER(notification.title) LIKE LOWER(:search) OR LOWER(notification.message) LIKE LOWER(:search))',
        { search: `%${queryDto.search}%` },
      );
    }

    const sortField =
      queryDto?.sortBy === 'createdAt'
        ? 'notification.createdAt'
        : 'notification.createdAt';
    const sortOrder = queryDto?.sortOrder || 'DESC';
    qb.orderBy(sortField, sortOrder);

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 15;
    qb.skip(skip).take(take);

    const [notifications, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({
      pageOptionsDto: queryDto || ({} as any),
      itemCount,
    });

    return new PageDto(notifications, pageMetaDto);
  }

  async getUnreadCount(
    recipientId: number,
    userType: string = 'user',
  ): Promise<{ count: number }> {
    const whereCondition: any = { isRead: false };
    if (userType === 'admin') {
      whereCondition.adminId = recipientId;
    } else {
      whereCondition.userId = recipientId;
    }

    const count = await this.notificationsRepository.count({
      where: whereCondition,
    });
    return { count };
  }

  async markAsRead(
    id: number,
    recipientId: number,
    userType: string = 'user',
  ): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    const isAuthorized =
      userType === 'admin'
        ? notification.adminId === recipientId
        : notification.userId === recipientId;

    if (!isAuthorized) {
      throw new ForbiddenException(
        'You are not authorized to update this notification',
      );
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(
    recipientId: number,
    userType: string = 'user',
  ): Promise<{ affected: number }> {
    const whereCondition: any = { isRead: false };
    if (userType === 'admin') {
      whereCondition.adminId = recipientId;
    } else {
      whereCondition.userId = recipientId;
    }

    const result = await this.notificationsRepository.update(whereCondition, {
      isRead: true,
    });
    return { affected: result.affected || 0 };
  }

  async remove(
    id: number,
    recipientId: number,
    userType: string = 'user',
  ): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    const isAuthorized =
      userType === 'admin'
        ? notification.adminId === recipientId
        : notification.userId === recipientId;

    if (!isAuthorized) {
      throw new ForbiddenException(
        'You are not authorized to delete this notification',
      );
    }

    await this.notificationsRepository.softRemove(notification);
  }
}
