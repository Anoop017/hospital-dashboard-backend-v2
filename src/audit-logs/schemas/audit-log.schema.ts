import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: { createdAt: 'timestamp', updatedAt: false } })
export class AuditLog {
  @Prop({ default: uuidv4, unique: true, index: true })
  eventId: string;

  @Prop({ index: true })
  userId: string; // UUID of acting user (nullable for system)

  @Prop()
  userEmail: string;

  @Prop()
  userRole: string;

  @Prop({ index: true })
  action: string;

  @Prop({ index: true })
  module: string;

  @Prop({ index: true })
  entityType: string;

  @Prop({ index: true })
  entityId: string;

  @Prop()
  description: string;

  @Prop()
  method: string;

  @Prop()
  endpoint: string;

  @Prop()
  statusCode: number;

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  requestId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  before: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  after: any;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata: any;

  @Prop()
  duration: number; // in ms
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
