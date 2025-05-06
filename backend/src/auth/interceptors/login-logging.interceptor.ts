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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LoginLoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logEntriesService: LogEntriesService,
    private readonly jwtService: JwtService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      tap(async (response) => {
        try {
          if (response?.access_token) {
            const payload = this.jwtService.decode(response.access_token);
            const logEntry = {
              userId: payload?.sub || 0,
              action: 'login',
              entity: 'auth',
              entityId: payload?.sub || 0,
              oldData: '',
              newData: JSON.stringify({
                email: request.body.email,
                success: true,
              }),
              ipAddress:
                request.ip || request.socket.remoteAddress || 'unknown',
              userAgent: request.headers['user-agent'] || 'unknown',
            };

            await this.logEntriesService.create(logEntry);
          }
        } catch (error) {
          console.error('Error logging login attempt:', error);
        }
      }),
    );
  }
}
