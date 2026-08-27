import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ default: uuidv4, unique: true, index: true })
  eventId: string;

  @Prop({ index: true })
  userId: string; // ID of acting user or 'system' / 'anonymous'

  @Prop({ index: true })
  userEmail: string;

  @Prop()
  userName: string; // Full name / display name of acting user

  @Prop({ index: true })
  userRole: string; // e.g., 'admin', 'doctor', 'patient', 'staff'

  @Prop({ default: false, index: true })
  isAdmin: boolean; // true for Admin/SuperAdmin, false for Doctor, Patient, Staff, etc.

  @Prop({ index: true })
  action: string; // e.g. 'APPOINTMENT_CREATE', 'STATUS_UPDATE', 'USER_LOGIN'

  @Prop({ index: true })
  module: string; // e.g. 'appointments', 'doctors', 'patients', 'auth'

  @Prop({ index: true })
  entityType: string; // e.g. 'Appointment', 'Doctor', 'Patient'

  @Prop({ index: true })
  entityId: string; // e.g. '12'

  @Prop()
  description: string; // Short summary description

  @Prop()
  details: string; // Rich detailed human-readable explanation of what happened

  @Prop({ default: 'SUCCESS', index: true })
  status: string; // 'SUCCESS' | 'FAILURE'

  @Prop()
  method: string; // 'POST', 'PATCH', 'PUT', 'DELETE', 'GET'

  @Prop({ index: true })
  endpoint: string; // Request URL e.g. '/api/v1/appointments/12/status'

  @Prop({ index: true })
  statusCode: number; // 200, 201, 400, 500, etc.

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop({ index: true })
  browser?: string;

  @Prop({ index: true })
  os?: string;

  @Prop({ index: true })
  device?: string;

  @Prop()
  clientSummary?: string;

  @Prop()
  requestId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  before: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  after: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: any;

  @Prop()
  duration: number; // in milliseconds

  createdAt?: Date;
  updatedAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Compound indexes for fast multi-field filtering in the admin panel
AuditLogSchema.index({ isAdmin: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, createdAt: -1 });
AuditLogSchema.index({ status: 1, createdAt: -1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ details: 'text', description: 'text', userEmail: 'text', userName: 'text' });
