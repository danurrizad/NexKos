import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Handle NestJS HttpException
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle array of messages
      let message = exceptionResponse;
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        message = Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message[0]
          : exceptionResponse.message;
      }

      // Customize error messages based on status code
      let customMessage = message;
      switch (status) {
        case HttpStatus.UNAUTHORIZED:
          customMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
          break;
        case HttpStatus.FORBIDDEN:
          customMessage =
            'Anda tidak memiliki akses untuk melakukan operasi ini.';
          break;
        case HttpStatus.NOT_FOUND:
          customMessage = 'Data yang Anda cari tidak ditemukan.';
          break;
        case HttpStatus.BAD_REQUEST:
          customMessage = 'Data yang Anda kirim tidak valid.';
          break;
        case HttpStatus.INTERNAL_SERVER_ERROR:
          customMessage =
            'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
          break;
      }

      return response.status(status).json({
        success: false,
        message: customMessage,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }

    // Handle other errors (non-HttpException)
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
