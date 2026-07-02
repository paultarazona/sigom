import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) || uuidv4();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Ha ocurrido un error interno.';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;
        const rawMessage = resp.message;
        if (Array.isArray(rawMessage)) {
          message = rawMessage.join(', ');
          details = rawMessage.map((m: string) => ({ message: m }));
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        } else {
          message = exception.message;
        }
        code = (resp.code as string) || code;
      } else {
        message = String(exceptionResponse);
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    });
  }
}
