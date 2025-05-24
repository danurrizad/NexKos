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

  private getClientIp(request: Request): string {
    // Check for forwarded IP from proxy
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      // Get the first IP in the chain (client IP)
      const ips = forwardedFor.toString().split(',');
      return ips[0].trim();
    }

    // Check other common proxy headers
    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp.toString();
    }

    // Fallback to direct connection IP
    return request.ip || request.socket.remoteAddress || 'unknown';
  }

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
              ipAddress: this.getClientIp(request),
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
