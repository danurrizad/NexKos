import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LogEntriesService } from '../../log-entries/log-entries.service';
import { Request } from 'express';

interface JwtPayload {
  sub: number;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logEntriesService: LogEntriesService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    const user = request.user;

    console.log('LoggingInterceptor - Request path:', request.path);
    console.log('LoggingInterceptor - User:', user);

    // Skip logging for certain paths and GET requests
    const skipPaths = ['/auth/login', '/auth/refresh', '/auth/logout'];
    if (skipPaths.includes(request.path) || request.method === 'GET') {
      console.log('LoggingInterceptor - Skipping due to path or method');
      return next.handle();
    }

    // Skip logging if no user is available
    if (!user?.sub) {
      console.log('LoggingInterceptor - Skipping due to no user');
      return next.handle();
    }

    // Get the old data for update/delete operations
    let oldData = '';
    if (
      request.method === 'PUT' ||
      request.method === 'PATCH' ||
      request.method === 'DELETE'
    ) {
      const id = request.params.id || request.body.id;
      if (id) {
        // Store the complete request body as oldData
        oldData = JSON.stringify(request.body);
      }
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          console.log('LoggingInterceptor - Response:', response);

          // Determine the action type
          let action = request.method;
          if (request.method === 'POST') action = 'create';
          if (request.method === 'PUT' || request.method === 'PATCH')
            action = 'update';
          if (request.method === 'DELETE') action = 'delete';

          // Get entity ID from response or request
          let entityId = 0;
          if (response?.data?.id) {
            entityId = response.data.id;
          } else if (response?.data?.[0]?.id) {
            entityId = response.data[0].id;
          } else if (response?.id) {
            entityId = response.id;
          } else {
            entityId = request.params.id || request.body.id || 0;
          }

          console.log('LoggingInterceptor - Entity ID:', entityId);

          const logEntry = {
            userId: user.sub,
            action,
            entity: request.path.split('/')[1] || 'unknown',
            entityId,
            oldData: oldData || '',
            newData:
              action === 'delete'
                ? ''
                : JSON.stringify({
                    requestBody: request.body || {},
                    response: response || {},
                  }),
            ipAddress: request.ip || request.socket.remoteAddress || 'unknown',
            userAgent: request.headers['user-agent'] || 'unknown',
          };

          console.log('LoggingInterceptor - Creating log entry:', logEntry);
          await this.logEntriesService.create(logEntry);
          console.log('LoggingInterceptor - Log entry created successfully');
        } catch (error) {
          console.error('Error logging request:', error);
        }
      }),
    );
  }
}
