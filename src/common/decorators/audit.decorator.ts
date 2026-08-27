import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA_KEY = 'audit_metadata';

export interface AuditActionOptions {
  module?: string;
  action?: string;
  entityType?: string;
  descriptionTemplate?: string;
}

export const AuditAction = (options: AuditActionOptions) =>
  SetMetadata(AUDIT_METADATA_KEY, options);
