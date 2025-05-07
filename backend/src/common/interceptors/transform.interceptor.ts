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
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data is already in the correct format, return it
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // If data has pagination info
        if (
          data &&
          typeof data === 'object' &&
          'data' in data &&
          'pagination' in data
        ) {
          return {
            success: true,
            message: 'Success',
            data: data.data,
            pagination: data.pagination,
          };
        }

        // Transform the response to the standard format
        return {
          success: true,
          message: 'Success',
          data: data,
        };
      }),
    );
  }
}
