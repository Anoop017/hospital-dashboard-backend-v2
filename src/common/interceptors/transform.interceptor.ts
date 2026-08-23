import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageDto } from '../pagination/page.dto';

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: any;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest();
    const statusCode = response.statusCode || HttpStatus.OK;

    return next.handle().pipe(
      map((resData) => {
        // If response is already in wrapped format, return directly
        if (resData && typeof resData === 'object' && resData.success !== undefined && resData.data !== undefined) {
          return resData;
        }

        // If response is a PageDto with data and meta
        if (resData instanceof PageDto || (resData && resData.data !== undefined && resData.meta !== undefined)) {
          return {
            success: true,
            statusCode,
            message: this.generateMessage(request.method, request.url),
            data: resData.data,
            meta: resData.meta,
            timestamp: new Date().toISOString(),
          };
        }

        return {
          success: true,
          statusCode,
          message: this.generateMessage(request.method, request.url),
          data: resData !== undefined ? resData : null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private generateMessage(method: string, url: string): string {
    const path = url.split('?')[0].replace('/api/v1/', '').replace('/', ' ');
    switch (method.toUpperCase()) {
      case 'POST':
        return `Resource created successfully`;
      case 'PUT':
      case 'PATCH':
        return `Resource updated successfully`;
      case 'DELETE':
        return `Resource deleted successfully`;
      case 'GET':
      default:
        return `Request completed successfully`;
    }
  }
}
