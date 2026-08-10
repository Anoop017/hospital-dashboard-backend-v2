import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../audit-logs/schemas/audit-log.schema';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.logAction(context, request, response, now, true, null),
        error: (err) => this.logAction(context, request, response, now, false, err),
      }),
    );
  }

  private logAction(
    context: ExecutionContext, 
    request: any, 
    response: any, 
    startTime: number, 
    isSuccess: boolean, 
    error: any
  ) {
    const duration = Date.now() - startTime;

    const statusCode = isSuccess ? response.statusCode : (error?.status || 500);

    // Log to console for all requests (useful for debugging/catching errors)
    if (isSuccess) {
      this.logger.log(`[${request.method}] ${request.url} - ${statusCode} - ${duration}ms`);
    } else {
      this.logger.error(`[${request.method}] ${request.url} - ${statusCode} - ${duration}ms - Error: ${error?.message}`);
    }

    // Skip saving GET requests to MongoDB to avoid DB overload
    if (request.method === 'GET') return;

    const className = context.getClass().name; // e.g., UsersController
    const handlerName = context.getHandler().name; // e.g., create, remove

    const moduleName = className.replace('Controller', '').toLowerCase(); // e.g., users
    
    // Convert handler name to past tense action
    let actionWord = handlerName;
    if (handlerName === 'create') actionWord = 'created';
    else if (handlerName === 'update') actionWord = 'updated';
    else if (handlerName === 'remove') actionWord = 'deleted';
    else if (handlerName === 'register') actionWord = 'registered';
    else if (handlerName === 'login') actionWord = 'logged in';

    // Generate descriptive message
    const description = `${moduleName} ${actionWord} ${isSuccess ? 'successfully' : 'failed'}`;

    const auditLog = new this.auditLogModel({
      userId: request.user?.userId || 'system',
      userEmail: request.user?.email,
      userRole: request.user?.roles?.join(','),
      action: actionWord, // short action
      module: moduleName,
      description: description, // The detailed sentence
      method: request.method,
      endpoint: request.url,
      statusCode: statusCode,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent'],
      duration,
      metadata: error ? { errorMessage: error.message } : null,
    });

    auditLog.save().catch((err) => console.error('Audit Log Failed:', err));
  }
}
