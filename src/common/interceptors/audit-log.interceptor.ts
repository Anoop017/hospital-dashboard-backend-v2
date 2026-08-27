import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../audit-logs/schemas/audit-log.schema';
import { AUDIT_METADATA_KEY, AuditActionOptions } from '../decorators/audit.decorator';
import { parseUserAgent } from '../utils/user-agent.util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('ActivityLogger');

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseData) =>
          this.recordLog(context, request, response, startTime, true, null, responseData),
        error: (error) =>
          this.recordLog(context, request, response, startTime, false, error, null),
      }),
    );
  }

  private async recordLog(
    context: ExecutionContext,
    request: any,
    response: any,
    startTime: number,
    isSuccess: boolean,
    error: any,
    responseData: any,
  ) {
    try {
      const duration = Date.now() - startTime;
      const statusCode = isSuccess ? (response.statusCode || 200) : (error?.status || error?.statusCode || 500);

      // Console logging
      if (isSuccess) {
        this.logger.log(`[${request.method}] ${request.url} - ${statusCode} - ${duration}ms`);
      } else {
        this.logger.warn(`[${request.method}] ${request.url} - ${statusCode} - ${duration}ms - Error: ${error?.message}`);
      }

      // We log all modifying requests (POST, PUT, PATCH, DELETE), plus auth queries or sensitive exports
      const method = request.method?.toUpperCase();
      const isModifying = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
      const isExportOrSpecial =
        request.url?.includes('/export') ||
        request.url?.includes('/login') ||
        request.url?.includes('/register');

      if (!isModifying && !isExportOrSpecial && method === 'GET') {
        // Skip common GET query polling to keep MongoDB lean
        return;
      }

      // Don't recursively log audit logs listing/export calls to prevent loop
      if (request.url?.includes('/audit-logs')) {
        return;
      }

      // Extract user info from request or response (for login/register endpoints)
      const user = request.user || responseData?.user || responseData?.data?.user;
      
      let rawRoles: any[] = [];
      if (Array.isArray(user?.roles)) {
        rawRoles = user.roles.map((r: any) => (typeof r === 'string' ? r : r?.name));
      } else if (typeof user?.roles === 'string') {
        rawRoles = [user.roles];
      }

      const roleStr = rawRoles.join(', ').toLowerCase();
      const isUrlAdminRegister = request.url?.includes('/register-admin');
      
      const isAdmin =
        isUrlAdminRegister ||
        roleStr.includes('admin') ||
        roleStr.includes('super_admin') ||
        user?.isSystem === true;

      const userName =
        user?.firstName || user?.lastName
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
          : request.body?.firstName || request.body?.lastName
          ? `${request.body.firstName || ''} ${request.body.lastName || ''}`.trim()
          : user?.email
          ? user.email.split('@')[0]
          : request.body?.email
          ? request.body.email.split('@')[0]
          : isAdmin
          ? 'Administrator'
          : 'System / Guest';

      const userEmail = user?.email || request.body?.email || 'system@hospital.com';
      const userId = String(user?.userId || user?.sub || user?.id || 'system');
      const userRole = rawRoles.length > 0 ? rawRoles.join(', ') : (isAdmin ? 'admin' : 'guest');

      // Extract endpoint & handler context
      const className = context.getClass().name; // e.g. AppointmentsController
      const handlerName = context.getHandler().name; // e.g. updateStatus
      const customMeta = this.reflector.get<AuditActionOptions>(
        AUDIT_METADATA_KEY,
        context.getHandler(),
      );

      const moduleName = customMeta?.module || className.replace(/Controller$/i, '').toLowerCase();
      const actionName = customMeta?.action || this.deriveActionName(handlerName, method, moduleName);

      // Extract entity details
      const entityId = request.params?.id || request.body?.id || responseData?.id || responseData?.data?.id || undefined;
      const entityType = customMeta?.entityType || this.deriveEntityType(moduleName);

      // Synthesize rich human-readable narrative details
      const details = this.synthesizeDetails({
        userName,
        userRole,
        isAdmin,
        moduleName,
        actionName,
        handlerName,
        method,
        url: request.url,
        params: request.params,
        body: request.body,
        isSuccess,
        statusCode,
        error,
        responseData,
        entityType,
        entityId,
      });

      const ipAddress =
        request.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
        request.ip ||
        request.connection?.remoteAddress ||
        '127.0.0.1';

      const sanitizedBody = this.sanitizeData(request.body);
      const sanitizedParams = this.sanitizeData(request.params);
      const sanitizedQuery = this.sanitizeData(request.query);

      const rawUserAgent = request.headers['user-agent'] || 'Unknown';
      const clientInfo = parseUserAgent(rawUserAgent);

      const auditLog = new this.auditLogModel({
        eventId: uuidv4(),
        userId,
        userEmail,
        userName,
        userRole,
        isAdmin,
        action: actionName,
        module: moduleName,
        entityType,
        entityId: entityId ? String(entityId) : undefined,
        description: `${actionName.replace(/_/g, ' ')} ${isSuccess ? 'completed' : 'failed'}`,
        details,
        status: isSuccess ? 'SUCCESS' : 'FAILURE',
        method,
        endpoint: request.url,
        statusCode,
        ipAddress,
        userAgent: rawUserAgent,
        browser: clientInfo.browser,
        os: clientInfo.os,
        device: clientInfo.device,
        clientSummary: clientInfo.clientSummary,
        duration,
        metadata: {
          params: sanitizedParams,
          query: sanitizedQuery,
          body: sanitizedBody,
          error: error ? { message: error.message, stack: error.stack } : undefined,
          responseSummary: isSuccess && responseData ? this.summarizeResponse(responseData) : undefined,
        },
      });

      await auditLog.save();
    } catch (saveError) {
      this.logger.error('Failed to persist audit log entry:', saveError);
    }
  }

  private deriveActionName(handlerName: string, method: string, moduleName: string): string {
    const cleanMod = moduleName.toUpperCase();
    const cleanHandler = handlerName.toUpperCase();

    if (cleanHandler.includes('LOGIN')) return 'USER_LOGIN';
    if (cleanHandler.includes('REGISTER_ADMIN') || cleanHandler.includes('REGISTERADMIN')) return 'ADMIN_REGISTER';
    if (cleanHandler.includes('REGISTER')) return 'USER_REGISTER';
    if (cleanHandler.includes('PASSWORD')) return 'PASSWORD_CHANGE';
    if (cleanHandler.includes('REFRESH')) return 'TOKEN_REFRESH';
    if (cleanHandler.includes('STATUS')) return `${cleanMod}_STATUS_UPDATE`;
    if (cleanHandler.includes('DISPENSE')) return `${cleanMod}_DISPENSED`;
    if (cleanHandler.includes('DISCHARGE')) return `${cleanMod}_DISCHARGED`;
    if (cleanHandler.includes('ADMIT')) return `${cleanMod}_ADMITTED`;
    if (cleanHandler.includes('CANCEL')) return `${cleanMod}_CANCELLED`;
    if (cleanHandler.includes('PAY') || cleanHandler.includes('PAYMENT')) return `${cleanMod}_PAYMENT_PROCESSED`;

    if (method === 'POST') return `${cleanMod}_CREATE`;
    if (method === 'PUT' || method === 'PATCH') return `${cleanMod}_UPDATE`;
    if (method === 'DELETE') return `${cleanMod}_DELETE`;
    return `${cleanMod}_${cleanHandler}`;
  }

  private deriveEntityType(moduleName: string): string {
    const map: Record<string, string> = {
      appointments: 'Appointment',
      doctors: 'Doctor',
      patients: 'Patient',
      staff: 'Staff',
      users: 'User',
      auth: 'Authentication',
      prescriptions: 'Prescription',
      medicines: 'Medicine',
      pharmacy: 'Pharmacy',
      laboratory: 'LabTest',
      billing: 'Invoice',
      payments: 'Payment',
      insurance: 'InsuranceClaim',
      admissions: 'Admission',
      beds: 'Bed',
      wards: 'Ward',
      departments: 'Department',
      notifications: 'Notification',
      'medical-records': 'MedicalRecord',
    };
    return map[moduleName] || moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
  }

  private synthesizeDetails(ctx: {
    userName: string;
    userRole: string;
    isAdmin: boolean;
    moduleName: string;
    actionName: string;
    handlerName: string;
    method: string;
    url: string;
    params: any;
    body: any;
    isSuccess: boolean;
    statusCode: number;
    error: any;
    responseData: any;
    entityType: string;
    entityId: any;
  }): string {
    const { userName, userRole, isAdmin, moduleName, body, params, isSuccess, error, entityId } = ctx;
    const actor = `${userName}${userRole && userRole !== 'guest' ? ` (${userRole})` : ''}`;

    if (!isSuccess) {
      const reason = error?.message || error?.response?.message || 'Operation failed';
      return `${actor} attempted ${ctx.actionName.replace(/_/g, ' ').toLowerCase()} on ${moduleName} but failed: ${reason}`;
    }

    // Module-specific narrative building
    switch (moduleName) {
      case 'auth': {
        if (ctx.handlerName === 'login' || ctx.url.includes('/login')) {
          return `${actor} logged in successfully`;
        }
        if (ctx.handlerName === 'registerAdmin' || ctx.url.includes('/register-admin')) {
          return `${actor} registered new administrator account '${body?.email || ''}'`;
        }
        if (ctx.handlerName === 'register' || ctx.url.includes('/register')) {
          return `New user account registered for '${body?.email || ''}'`;
        }
        if (ctx.handlerName === 'changePassword' || ctx.url.includes('/change-password')) {
          return `${actor} updated account password successfully`;
        }
        if (ctx.handlerName === 'refresh' || ctx.url.includes('/refresh')) {
          return `${actor} refreshed authentication token`;
        }
        return `${actor} performed authentication action (${ctx.handlerName})`;
      }

      case 'appointments': {
        if (params?.id && body?.status) {
          return `${actor} updated status of appointment #${params.id} to '${body.status.toUpperCase()}'`;
        }
        if (ctx.method === 'POST') {
          const docInfo = body?.doctorId ? ` with Doctor #${body.doctorId}` : '';
          const patInfo = body?.patientId ? ` for Patient #${body.patientId}` : '';
          const dateInfo = body?.appointmentDate ? ` on ${body.appointmentDate}` : '';
          return `${actor} scheduled a new appointment${docInfo}${patInfo}${dateInfo}`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated details for appointment #${params?.id || entityId || ''}`;
        }
        if (ctx.method === 'DELETE') {
          return `${actor} cancelled / removed appointment #${params?.id || entityId || ''}`;
        }
        return `${actor} updated appointment #${params?.id || entityId || ''}`;
      }

      case 'doctors': {
        if (ctx.method === 'POST') {
          const docName = body?.firstName || body?.lastName ? `${body.firstName || ''} ${body.lastName || ''}`.trim() : '';
          const spec = body?.specialization ? ` (${body.specialization})` : '';
          return `${actor} registered doctor profile for Dr. ${docName}${spec}`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated doctor profile #${params?.id || entityId || ''}`;
        }
        if (ctx.method === 'DELETE') {
          return `${actor} deleted doctor profile #${params?.id || entityId || ''}`;
        }
        return `${actor} modified doctor record #${params?.id || entityId || ''}`;
      }

      case 'patients': {
        if (ctx.method === 'POST') {
          const patName = body?.firstName || body?.lastName ? `${body.firstName || ''} ${body.lastName || ''}`.trim() : '';
          return `${actor} registered new patient record for '${patName}'`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated patient record #${params?.id || entityId || ''}`;
        }
        if (ctx.method === 'DELETE') {
          return `${actor} removed patient record #${params?.id || entityId || ''}`;
        }
        return `${actor} modified patient record #${params?.id || entityId || ''}`;
      }

      case 'prescriptions': {
        if (ctx.method === 'POST') {
          const patInfo = body?.patientId ? ` for Patient #${body.patientId}` : '';
          return `${actor} created new medical prescription${patInfo}`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} modified prescription #${params?.id || entityId || ''}`;
        }
        if (ctx.method === 'DELETE') {
          return `${actor} cancelled prescription #${params?.id || entityId || ''}`;
        }
        return `${actor} updated prescription #${params?.id || entityId || ''}`;
      }

      case 'medical-records': {
        if (ctx.method === 'POST') {
          return `${actor} recorded new clinical medical record for Patient #${body?.patientId || ''}`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated medical record #${params?.id || entityId || ''}`;
        }
        if (ctx.method === 'DELETE') {
          return `${actor} removed medical record #${params?.id || entityId || ''}`;
        }
        return `${actor} updated medical record #${params?.id || entityId || ''}`;
      }

      case 'billing':
      case 'payments': {
        if (body?.amount || body?.totalAmount) {
          const amt = body.amount || body.totalAmount;
          return `${actor} processed billing / payment of $${amt} for Patient #${body?.patientId || params?.id || ''}`;
        }
        if (ctx.method === 'POST') {
          return `${actor} created new billing invoice for Patient #${body?.patientId || ''}`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated invoice #${params?.id || entityId || ''}`;
        }
        return `${actor} performed billing operation on #${params?.id || entityId || ''}`;
      }

      case 'staff': {
        if (ctx.method === 'POST') {
          const staffName = body?.firstName || body?.lastName ? `${body.firstName || ''} ${body.lastName || ''}`.trim() : '';
          const desig = body?.designation ? ` as ${body.designation}` : '';
          return `${actor} added new staff member '${staffName}'${desig}`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated staff member #${params?.id || entityId || ''}`;
        }
        if (ctx.method === 'DELETE') {
          return `${actor} deleted staff record #${params?.id || entityId || ''}`;
        }
        return `${actor} modified staff record #${params?.id || entityId || ''}`;
      }

      case 'admissions': {
        if (ctx.handlerName?.toLowerCase().includes('discharge') || ctx.url.includes('/discharge')) {
          return `${actor} discharged patient from admission #${params?.id || entityId || ''}`;
        }
        if (ctx.method === 'POST') {
          return `${actor} admitted Patient #${body?.patientId || ''} to Ward #${body?.wardId || ''} (Bed #${body?.bedId || ''})`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated admission record #${params?.id || entityId || ''}`;
        }
        return `${actor} modified admission #${params?.id || entityId || ''}`;
      }

      case 'pharmacy':
      case 'medicines': {
        if (ctx.handlerName?.toLowerCase().includes('dispense')) {
          return `${actor} dispensed pharmacy medication for Prescription #${params?.id || body?.prescriptionId || ''}`;
        }
        if (ctx.method === 'POST') {
          return `${actor} added new medicine '${body?.name || ''}' to inventory`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated stock / details for medicine #${params?.id || entityId || ''}`;
        }
        return `${actor} modified pharmacy medicine #${params?.id || entityId || ''}`;
      }

      case 'laboratory': {
        if (ctx.method === 'POST') {
          return `${actor} ordered lab test '${body?.testName || 'General Lab Test'}' for Patient #${body?.patientId || ''}`;
        }
        if (ctx.method === 'PATCH' || ctx.method === 'PUT') {
          return `${actor} updated laboratory test results for #${params?.id || entityId || ''}`;
        }
        return `${actor} updated laboratory test #${params?.id || entityId || ''}`;
      }

      default: {
        const actionVerb =
          ctx.method === 'POST' ? 'created' : ctx.method === 'DELETE' ? 'deleted' : 'updated';
        const target = entityId ? `#${entityId}` : (body?.name ? `'${body.name}'` : '');
        return `${actor} ${actionVerb} ${ctx.entityType || moduleName} ${target}`.trim();
      }
    }
  }

  private sanitizeData(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.sanitizeData(item));

    const sensitiveFields = [
      'password',
      'currentpassword',
      'newpassword',
      'passwordconfirm',
      'token',
      'refreshtoken',
      'accesstoken',
      'creditcard',
      'cvv',
      'secret',
    ];

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveFields.includes(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeData(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private summarizeResponse(data: any): any {
    if (!data) return null;
    if (typeof data !== 'object') return { value: String(data) };
    if (Array.isArray(data)) return { count: data.length };

    const summary: Record<string, any> = {};
    if (data.id || data._id) summary.id = data.id || data._id;
    if (data.status) summary.status = data.status;
    if (data.message) summary.message = data.message;
    if (data.email) summary.email = data.email;
    return Object.keys(summary).length > 0 ? summary : { success: true };
  }
}
