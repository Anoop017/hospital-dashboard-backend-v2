import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as xss from 'xss';

@Injectable()
export class XssInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.body) {
      Object.defineProperty(request, 'body', { value: this.sanitize(request.body), configurable: true, enumerable: true, writable: true });
    }
    if (request.query) {
      Object.defineProperty(request, 'query', { value: this.sanitize(request.query), configurable: true, enumerable: true, writable: true });
    }
    if (request.params) {
      Object.defineProperty(request, 'params', { value: this.sanitize(request.params), configurable: true, enumerable: true, writable: true });
    }

    return next.handle();
  }

  private sanitize(obj: any): any {
    if (typeof obj === 'string') {
      return xss.filterXSS(obj);
    }   

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitizedObj: any = {};
      for (const key of Object.keys(obj)) {
        sanitizedObj[key] = this.sanitize(obj[key]);
      }
      return sanitizedObj;
    }

    return obj;
  }
}
