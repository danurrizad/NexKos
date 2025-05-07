import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  private getContextMessage(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const segments = url.split('/').filter(Boolean); // Get URL segments and remove empty strings

    // Check for specific endpoints first
    if (segments.includes('auth')) {
      if (segments.includes('login')) {
        return 'Login berhasil';
      }
      if (segments.includes('register')) {
        return 'Registrasi berhasil';
      }
      if (segments.includes('logout')) {
        return 'Anda berhasil keluar dari akun';
      }
    }

    const messages = {
      GET: {
        default: 'Data berhasil diambil',
        list: 'Data berhasil diambil',
        detail: 'Data berhasil diambil',
      },
      POST: {
        default: 'Data berhasil dibuat',
        create: 'Data berhasil dibuat',
      },
      PUT: {
        default: 'Data berhasil diperbarui',
        update: 'Data berhasil diperbarui',
      },
      PATCH: {
        default: 'Data berhasil diperbarui',
        update: 'Data berhasil diperbarui',
      },
      DELETE: {
        default: 'Data berhasil dihapus',
        delete: 'Data berhasil dihapus',
      },
    };

    // Get the appropriate message based on HTTP method
    const methodMessages = messages[method] || messages.GET;

    // Try to get a specific message for the resource, fallback to default
    return methodMessages[segments[0]] || methodMessages.default;
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data has pagination info
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'pagination' in data
        ) {
          return {
            success: true,
            message: this.getContextMessage(context),
            data: data.data,
            pagination: data.pagination,
          };
        }

        // Check if data only contains success flag
        const isOnlySuccess =
          data &&
          typeof data === 'object' &&
          Object.keys(data).length === 1 &&
          'success' in data;

        // Transform the response to the standard format
        return {
          success: data?.success ?? true,
          message: this.getContextMessage(context),
          ...(isOnlySuccess ? {} : { data }),
        };
      }),
    );
  }
}
