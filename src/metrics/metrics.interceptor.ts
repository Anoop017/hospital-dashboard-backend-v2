import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Counter, Histogram } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Request, Response } from 'express';
import {
  METRIC_HTTP_REQUESTS_TOTAL,
  METRIC_HTTP_REQUEST_DURATION_SECONDS,
} from './metrics.constants';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric(METRIC_HTTP_REQUESTS_TOTAL)
    private readonly requestCounter: Counter<string>,
    @InjectMetric(METRIC_HTTP_REQUEST_DURATION_SECONDS)
    private readonly durationHistogram: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    // Skip metrics and health check endpoints to avoid self-pollution
    const originalUrl = req.originalUrl || req.url || '';
    if (
      originalUrl.includes('/metrics') ||
      originalUrl.includes('/health') ||
      originalUrl.includes('/docs') ||
      originalUrl.includes('/favicon.ico')
    ) {
      return next.handle();
    }

    const startTime = process.hrtime();
    const method = req.method;

    return next.handle().pipe(
      tap({
        next: () => {
          this.recordMetrics(req, res.statusCode || 200, startTime, method);
        },
        error: (error: any) => {
          const status =
            error?.status ||
            error?.statusCode ||
            (error?.response && error?.response?.statusCode) ||
            500;
          this.recordMetrics(req, status, startTime, method);
        },
      }),
    );
  }

  private recordMetrics(
    req: Request,
    statusCode: number,
    startTime: [number, number],
    method: string,
  ) {
    const diff = process.hrtime(startTime);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    const route = this.normalizeRoute(req);
    const statusClass = `${Math.floor(statusCode / 100)}xx`;

    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      status_class: statusClass,
    };

    this.requestCounter.inc(labels);
    this.durationHistogram.observe(labels, durationInSeconds);
  }

  private normalizeRoute(req: Request): string {
    const path = req.baseUrl || req.path || req.url || 'unknown';

    return path
      // Replace UUIDs
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ':id')
      // Replace MongoDB 24-character ObjectIds
      .replace(/[0-9a-f]{24}/gi, ':id')
      // Replace numeric IDs
      .replace(/\/\d+(?=\/|$)/g, '/:id');
  }
}
