import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { NotificationPriority, NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'Recipient user ID' })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Notification message body' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ enum: NotificationType, default: NotificationType.SYSTEM })
  @IsOptional()
  @IsString()
  type?: string = NotificationType.SYSTEM;

  @ApiPropertyOptional({ enum: NotificationPriority, default: NotificationPriority.INFO })
  @IsOptional()
  @IsString()
  priority?: string = NotificationPriority.INFO;

  @ApiPropertyOptional({ description: 'Action URL/route when clicking notification' })
  @IsOptional()
  @IsString()
  link?: string;

  @ApiPropertyOptional({ description: 'Additional structured metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
