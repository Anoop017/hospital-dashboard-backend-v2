import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { parseUserAgent } from '../common/utils/user-agent.util';
import type { Response } from 'express';
import * as ExcelJS from 'exceljs';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(dto: CreateAuditLogDto): Promise<AuditLogDocument> {
    const rolesStr = (dto.userRole || '').toLowerCase();
    const isAdmin =
      dto.isAdmin !== undefined
        ? dto.isAdmin
        : rolesStr.includes('admin') || rolesStr.includes('super_admin');

    const clientInfo = parseUserAgent(dto.userAgent);

    const auditLog = new this.auditLogModel({
      ...dto,
      browser: dto.browser || clientInfo.browser,
      os: dto.os || clientInfo.os,
      device: dto.device || clientInfo.device,
      clientSummary: dto.clientSummary || clientInfo.clientSummary,
      isAdmin,
      status: dto.status || 'SUCCESS',
    });

    return auditLog.save();
  }

  private buildFilter(query: QueryAuditLogDto): Record<string, any> {
    const filter: Record<string, any> = {};

    if (query.isAdmin !== undefined) {
      filter.isAdmin = query.isAdmin;
    }

    if (query.module) {
      filter.module = { $regex: query.module, $options: 'i' };
    }

    if (query.action) {
      filter.action = { $regex: query.action, $options: 'i' };
    }

    if (query.status) {
      filter.status = query.status.toUpperCase();
    }

    if (query.userRole) {
      filter.userRole = { $regex: query.userRole, $options: 'i' };
    }

    if (query.userId) {
      filter.userId = query.userId;
    }

    if (query.userEmail) {
      filter.userEmail = { $regex: query.userEmail, $options: 'i' };
    }

    if (query.entityType) {
      filter.entityType = { $regex: query.entityType, $options: 'i' };
    }

    if (query.method) {
      filter.method = query.method.toUpperCase();
    }

    if (query.statusCode) {
      filter.statusCode = query.statusCode;
    }

    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (query.search && query.search.trim()) {
      const searchRegex = { $regex: query.search.trim(), $options: 'i' };
      filter.$or = [
        { details: searchRegex },
        { description: searchRegex },
        { userEmail: searchRegex },
        { userName: searchRegex },
        { endpoint: searchRegex },
        { action: searchRegex },
        { module: searchRegex },
        { ipAddress: searchRegex },
        { entityId: searchRegex },
        { entityType: searchRegex },
        { browser: searchRegex },
        { os: searchRegex },
        { device: searchRegex },
      ];
    }

    return filter;
  }

  async findAll(query: QueryAuditLogDto) {
    const filter = this.buildFilter(query);

    const page = query.page || 1;
    const limit = query.limit || query.take || 20;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || '_id';
    let sortDirection: 1 | -1 = -1; // Default: newest first
    if (query.sortOrder === 'ASC') {
      sortDirection = 1;
    } else if (query.sortOrder === 'DESC') {
      sortDirection = -1;
    }
    const sort: any = { [sortBy]: sortDirection };

    const [rawLogs, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(filter).exec(),
    ]);

    const logs = rawLogs.map((log: any) => {
      const clientInfo = parseUserAgent(log.userAgent);
      const browser = log.browser || clientInfo.browser;
      const os = log.os || clientInfo.os;
      const device = log.device || clientInfo.device;
      const clientSummary = log.clientSummary || clientInfo.clientSummary;

      return {
        ...log,
        browser,
        os,
        device,
        clientSummary,
        details: log.details || log.description || `${log.module || 'system'} ${log.action || 'action'}`,
        status: log.status || (log.statusCode && log.statusCode < 400 ? 'SUCCESS' : 'FAILURE'),
        isAdmin: log.isAdmin !== undefined ? log.isAdmin : (log.userRole || '').toLowerCase().includes('admin'),
        createdAt: log.createdAt || log.timestamp,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<AuditLogDocument> {
    let log: AuditLogDocument | null = null;
    if (Types.ObjectId.isValid(id)) {
      log = (await this.auditLogModel.findById(id).lean().exec()) as any;
    }
    if (!log) {
      log = (await this.auditLogModel.findOne({ eventId: id }).lean().exec()) as any;
    }

    if (!log) {
      throw new NotFoundException(`Audit log record '${id}' not found`);
    }

    const clientInfo = parseUserAgent(log.userAgent);
    return {
      ...log,
      browser: log.browser || clientInfo.browser,
      os: log.os || clientInfo.os,
      device: log.device || clientInfo.device,
      clientSummary: log.clientSummary || clientInfo.clientSummary,
    } as any;
  }

  async getStats(query: QueryAuditLogDto) {
    const filter = this.buildFilter(query);

    const [
      total,
      adminLogsCount,
      nonAdminLogsCount,
      successCount,
      failureCount,
      inProgressCount,
      avgDurationResult,
      moduleDistribution,
      topActions,
      recentFailures,
    ] = await Promise.all([
      this.auditLogModel.countDocuments(filter).exec(),
      this.auditLogModel.countDocuments({ ...filter, isAdmin: true }).exec(),
      this.auditLogModel.countDocuments({ ...filter, isAdmin: false }).exec(),
      this.auditLogModel.countDocuments({ ...filter, status: 'SUCCESS' }).exec(),
      this.auditLogModel.countDocuments({ ...filter, status: 'FAILURE' }).exec(),
      this.auditLogModel.countDocuments({ ...filter, status: 'IN_PROGRESS' }).exec(),
      this.auditLogModel.aggregate([
        { $match: filter },
        { $group: { _id: null, avgDuration: { $avg: '$duration' } } },
      ]),
      this.auditLogModel.aggregate([
        { $match: filter },
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      this.auditLogModel.aggregate([
        { $match: filter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      this.auditLogModel
        .find({ ...filter, status: 'FAILURE' })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
        .exec(),
    ]);

    const averageDuration = avgDurationResult.length > 0 && avgDurationResult[0].avgDuration
      ? Math.round(avgDurationResult[0].avgDuration)
      : 0;

    return {
      total,
      adminLogsCount,
      nonAdminLogsCount,
      successCount,
      failureCount,
      inProgressCount,
      averageDuration, // in ms (for the KPI card in UI)
      successPercentage: total > 0 ? Number(((successCount / total) * 100).toFixed(1)) : 0,
      failurePercentage: total > 0 ? Number(((failureCount / total) * 100).toFixed(1)) : 0,
      inProgressPercentage: total > 0 ? Number(((inProgressCount / total) * 100).toFixed(1)) : 0,
      moduleDistribution: moduleDistribution.map((m) => ({ module: m._id, count: m.count })),
      topActions: topActions.map((a) => ({ action: a._id, count: a.count })),
      recentFailures,
    };
  }

  async getFilterOptions() {
    const [modules, actions, entityTypes, roles, browsers, osList] = await Promise.all([
      this.auditLogModel.distinct('module').exec(),
      this.auditLogModel.distinct('action').exec(),
      this.auditLogModel.distinct('entityType').exec(),
      this.auditLogModel.distinct('userRole').exec(),
      this.auditLogModel.distinct('browser').exec(),
      this.auditLogModel.distinct('os').exec(),
    ]);

    return {
      modules: modules.filter(Boolean).sort(),
      actions: actions.filter(Boolean).sort(),
      entityTypes: entityTypes.filter(Boolean).sort(),
      roles: roles.filter(Boolean).sort(),
      browsers: browsers.filter(Boolean).sort(),
      osList: osList.filter(Boolean).sort(),
      devices: ['Desktop', 'Mobile', 'Tablet', 'API Client', 'Bot'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      statuses: ['SUCCESS', 'FAILURE', 'IN_PROGRESS'],
    };
  }

  async exportToExcel(query: QueryAuditLogDto, res: Response): Promise<void> {
    const filter = this.buildFilter(query);
    const sortBy = query.sortBy || '_id';
    let sortDirection: 1 | -1 = -1; // Default: newest first
    if (query.sortOrder === 'ASC') {
      sortDirection = 1;
    } else if (query.sortOrder === 'DESC') {
      sortDirection = -1;
    }
    const sort: any = { [sortBy]: sortDirection };

    // Retrieve records for export (up to 10,000)
    const rawLogs = await this.auditLogModel
      .find(filter)
      .sort(sort)
      .limit(10000)
      .lean()
      .exec();

    const logs = rawLogs.map((log: any) => {
      const clientInfo = parseUserAgent(log.userAgent);
      const browser = log.browser || clientInfo.browser;
      const os = log.os || clientInfo.os;
      const device = log.device || clientInfo.device;
      const clientSummary = log.clientSummary || clientInfo.clientSummary;

      return {
        ...log,
        browser,
        os,
        device,
        clientSummary,
        details: log.details || log.description || `${log.module || 'system'} ${log.action || 'action'}`,
        status: log.status || (log.statusCode && log.statusCode < 400 ? 'SUCCESS' : 'FAILURE'),
        isAdmin: log.isAdmin !== undefined ? log.isAdmin : (log.userRole || '').toLowerCase().includes('admin'),
        createdAt: log.createdAt || log.timestamp,
        userName: log.userName || (log.isAdmin ? 'Administrator' : 'User'),
        userRole: log.userRole || (log.isAdmin ? 'admin' : 'staff/user'),
      };
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Hospital Management System';
    workbook.created = new Date();

    const sheetName =
      query.isAdmin === true
        ? 'Admin Activity Logs'
        : query.isAdmin === false
        ? 'Staff & Patient Logs'
        : 'All Activity Logs';

    const worksheet = workbook.addWorksheet(sheetName, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    worksheet.columns = [
      { header: 'Event ID', key: 'eventId', width: 36 },
      { header: 'Date & Time', key: 'timestamp', width: 22 },
      { header: 'Performed By', key: 'userName', width: 22 },
      { header: 'Email', key: 'userEmail', width: 26 },
      { header: 'Role', key: 'userRole', width: 16 },
      { header: 'Admin Log?', key: 'isAdmin', width: 14 },
      { header: 'Module', key: 'module', width: 18 },
      { header: 'Action', key: 'action', width: 25 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Status Code', key: 'statusCode', width: 14 },
      { header: 'Browser', key: 'browser', width: 22 },
      { header: 'Operating System', key: 'os', width: 18 },
      { header: 'Device', key: 'device', width: 14 },
      { header: 'Activity Details', key: 'details', width: 50 },
      { header: 'HTTP Method', key: 'method', width: 12 },
      { header: 'Endpoint', key: 'endpoint', width: 32 },
      { header: 'IP Address', key: 'ipAddress', width: 16 },
      { header: 'Duration (ms)', key: 'duration', width: 14 },
    ];

    // Style Header Row
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' }, // Dark slate
      };
      cell.font = {
        name: 'Segoe UI',
        size: 11,
        bold: true,
        color: { argb: 'FFFFFFFF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF334155' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        right: { style: 'thin', color: { argb: 'FF334155' } },
      };
    });

    // Populate Data Rows
    logs.forEach((log, index) => {
      const createdAtDate = log.createdAt ? new Date(log.createdAt) : new Date();
      const formattedDate = createdAtDate.toISOString().replace('T', ' ').substring(0, 19);

      const row = worksheet.addRow({
        eventId: log.eventId || '-',
        timestamp: formattedDate,
        userName: log.userName || (log.isAdmin ? 'Admin' : 'User'),
        userEmail: log.userEmail || 'system@hospital.com',
        userRole: (log.userRole || '').toUpperCase() || (log.isAdmin ? 'ADMIN' : 'USER'),
        isAdmin: log.isAdmin ? 'YES (Admin)' : 'NO (User/Staff)',
        module: (log.module || '').toUpperCase(),
        action: log.action || '-',
        status: log.status || 'SUCCESS',
        statusCode: log.statusCode || 200,
        browser: log.browser || '-',
        os: log.os || '-',
        device: log.device || '-',
        details: log.details || log.description || '-',
        method: log.method || 'POST',
        endpoint: log.endpoint || '-',
        ipAddress: log.ipAddress || '127.0.0.1',
        duration: log.duration ? `${log.duration} ms` : '-',
      });

      row.height = 22;

      // Alternating background
      const isEven = index % 2 === 0;
      const bgArgb = isEven ? 'FFFFFFFF' : 'FFF8FAFC';

      row.eachCell((cell, colNumber) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: bgArgb },
        };
        cell.font = { name: 'Segoe UI', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        };

        // Align numbers / center columns
        if (
          colNumber === 2 ||
          colNumber === 6 ||
          colNumber === 9 ||
          colNumber === 10 ||
          colNumber === 12 ||
          colNumber === 14 ||
          colNumber === 15
        ) {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        }

        // Status highlight (Col 9)
        if (colNumber === 9) {
          const isSuccess = log.status === 'SUCCESS';
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: isSuccess ? 'FFDCFCE7' : 'FFFEE2E2' },
          };
          cell.font = {
            name: 'Segoe UI',
            size: 10,
            bold: true,
            color: { argb: isSuccess ? 'FF15803D' : 'FFB91C1C' },
          };
        }

        // Admin flag highlight (Col 6)
        if (colNumber === 6) {
          cell.font = {
            name: 'Segoe UI',
            size: 10,
            bold: true,
            color: { argb: log.isAdmin ? 'FF4338CA' : 'FF475569' },
          };
        }
      });
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `hospital_audit_logs_${timestamp}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
  }
}
