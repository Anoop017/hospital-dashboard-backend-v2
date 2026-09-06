import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { Admin } from '../../admins/entities/admin.entity';

export enum NotificationType {
  APPOINTMENT = 'appointment',
  ADMISSION = 'admission',
  BILLING = 'billing',
  LAB = 'lab',
  PRESCRIPTION = 'prescription',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  INFO = 'info',
  WARNING = 'warning',
  URGENT = 'urgent',
}

@Entity('notifications')
@Index(['userId', 'isRead'])
@Index(['userId', 'createdAt'])
@Index(['adminId', 'isRead'])
@Index(['adminId', 'createdAt'])
export class Notification extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @ManyToOne(() => Admin, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'adminId' })
  admin: Admin;

  @Column({ nullable: true })
  adminId: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({
    type: 'varchar',
    default: NotificationType.SYSTEM,
  })
  type: string;

  @Column({
    type: 'varchar',
    default: NotificationPriority.INFO,
  })
  priority: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'varchar', nullable: true })
  link: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
