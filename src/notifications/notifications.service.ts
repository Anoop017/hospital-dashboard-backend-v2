import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { PageDto } from '../common/pagination/page.dto';
import { PageMetaDto } from '../common/pagination/page-meta.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationsRepository.create(createNotificationDto);
    return this.notificationsRepository.save(notification);
  }

  async createForUsers(
    userIds: number[],
    data: Omit<CreateNotificationDto, 'userId'>,
  ): Promise<Notification[]> {
    if (!userIds || userIds.length === 0) return [];
    
    // De-duplicate user IDs
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
      const adminUsers = await this.usersRepository
        .createQueryBuilder('user')
        .innerJoin('user.roles', 'role')
        .where('role.name IN (:...roleNames)', { roleNames: ['admin', 'super_admin'] })
        .andWhere('user.isActive = true')
        .getMany();

      const adminUserIds = adminUsers.map((u) => u.id);
      return this.createForUsers(adminUserIds, data);
    } catch (error) {
      console.error('Failed to notify admins:', error);
      return [];
    }
  }

  async findMyNotifications(
    userId: number,
    queryDto?: QueryNotificationDto,
  ): Promise<PageDto<Notification>> {
    const qb = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

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
      queryDto?.sortBy === 'createdAt' ? 'notification.createdAt' : 'notification.createdAt';
    const sortOrder = queryDto?.sortOrder || 'DESC';
    qb.orderBy(sortField, sortOrder);

    const skip = queryDto?.skip || 0;
    const take = queryDto?.take || 15;
    qb.skip(skip).take(take);

    const [notifications, itemCount] = await qb.getManyAndCount();
    const pageMetaDto = new PageMetaDto({ pageOptionsDto: queryDto || ({} as any), itemCount });

    return new PageDto(notifications, pageMetaDto);
  }

  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.notificationsRepository.count({
      where: {
        userId,
        isRead: false,
      },
    });
    return { count };
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You are not authorized to update this notification');
    }

    notification.isRead = true;
    return this.notificationsRepository.save(notification);
  }

  async markAllAsRead(userId: number): Promise<{ affected: number }> {
    const result = await this.notificationsRepository.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { affected: result.affected || 0 };
  }

  async remove(id: number, userId: number): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You are not authorized to delete this notification');
    }

    await this.notificationsRepository.softRemove(notification);
  }
}
