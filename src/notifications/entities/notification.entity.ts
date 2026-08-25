import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

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
export class Notification extends BaseEntity {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

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
