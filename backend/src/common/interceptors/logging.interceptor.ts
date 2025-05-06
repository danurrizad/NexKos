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
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logEntriesService: LogEntriesService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: User }>();
    const user = request.user;

    // Skip logging for certain paths
    const skipPaths = ['/auth/login', '/auth/refresh', '/auth/logout'];
    if (skipPaths.includes(request.path)) {
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
        oldData = JSON.stringify({ id });
      }
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          // Determine the action type
          let action = request.method;
          if (request.method === 'POST') action = 'create';
          if (request.method === 'PUT' || request.method === 'PATCH')
            action = 'update';
          if (request.method === 'DELETE') action = 'delete';

          // Get entity ID from response or request
          const entityId =
            response?.id || request.params.id || request.body.id || 0;

          const logEntry = {
            userId: user?.id || 0,
            action,
            entity: request.path.split('/')[1] || 'unknown',
            entityId,
            oldData,
            newData: JSON.stringify({
              requestBody: request.body || {},
              response: response || {},
            }),
            ipAddress: request.ip || request.socket.remoteAddress || 'unknown',
            userAgent: request.headers['user-agent'] || 'unknown',
          };

          await this.logEntriesService.create(logEntry);
        } catch (error) {
          console.error('Error logging request:', error);
        }
      }),
    );
  }
}
