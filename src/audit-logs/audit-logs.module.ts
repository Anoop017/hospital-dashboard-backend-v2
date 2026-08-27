import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLog, AuditLogSchema } from './schemas/audit-log.schema';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogsController } from './audit-logs.controller';
import { AuditLogInterceptor } from '../common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
  ],
  controllers: [AuditLogsController],
  providers: [
    AuditLogsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
  exports: [AuditLogsService, MongooseModule],
})
export class AuditLogsModule {}
