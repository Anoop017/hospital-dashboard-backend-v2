import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../audit-logs/schemas/audit-log.schema';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        
        // Skip logging GET requests to avoid DB overload (can be configured)
        if (request.method === 'GET') return;

        const auditLog = new this.auditLogModel({
          userId: request.user?.userId || 'system',
          userEmail: request.user?.email,
          userRole: request.user?.roles?.join(','),
          action: request.method,
          module: request.url.split('/')[2] || 'unknown', // e.g., /api/v1/patients -> patients
          endpoint: request.url,
          statusCode: response.statusCode,
          ipAddress: request.ip,
          userAgent: request.headers['user-agent'],
          duration,
        });

        auditLog.save().catch((err) => console.error('Audit Log Failed:', err));
      }),
    );
  }
}
