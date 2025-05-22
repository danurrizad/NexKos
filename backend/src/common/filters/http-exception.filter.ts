import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  ValidationError,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errors: string[] | null = null;

    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();

      // Handle validation errors
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        if (Array.isArray(exceptionResponse.message)) {
          // This is a validation error
          errors = exceptionResponse.message;
          message = 'Validasi gagal';
        } else {
          message = exceptionResponse.message as string;
        }
      } else {
        message = exception.message;
      }
    }

    // Log error for debugging
    this.logger.error(
      `Exception: ${message}`,
      exception instanceof Error ? exception.stack : 'Unknown error',
    );

    // Customize error messages based on status code and path
    let customMessage = message;
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        // Jika ini adalah endpoint login, gunakan pesan asli
        if (request.path === '/auth/login') {
          customMessage = message;
        } else {
          customMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
        }
        break;
      case HttpStatus.FORBIDDEN:
        customMessage =
          'Anda tidak memiliki akses untuk melakukan operasi ini.';
        break;
      case HttpStatus.NOT_FOUND:
        customMessage = 'Data yang Anda cari tidak ditemukan.';
        break;
      case HttpStatus.BAD_REQUEST:
        if (errors) {
          // Jika ada error validasi, gunakan pesan error pertama
          customMessage = errors[0];
        } else {
          customMessage = message;
        }
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        customMessage =
          'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
        break;
    }

    return response.status(status).json({
      statusCode: status,
      message: customMessage,
      errors: errors, // Include validation errors if any
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
