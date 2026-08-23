import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorName = 'Internal Server Error';
    let message: any = 'Internal server error occurred';
    let errors: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as any;
        message = resObj.message || resObj.error || message;
        errorName = resObj.error || this.getErrorName(status);
        if (Array.isArray(resObj.message)) {
          // Class validator error array
          message = resObj.message.join(', ');
          errors = resObj.message;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorName = exception.name || 'Error';
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      error: errorName,
      message: message,
      errors: errors,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }

  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Not Found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable Entity';
      default:
        return 'Internal Server Error';
    }
  }
}
