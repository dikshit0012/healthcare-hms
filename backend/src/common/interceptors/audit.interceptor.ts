import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, body, ip } = req;

    // Only audit mutations
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const userId = req.user?.sub;
    const userRole = req.user?.role;

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          // Fire and forget — don't block the response
          this.prisma.auditLog.create({
            data: {
              actorId: userId,
              actorRole: userRole,
              action: `${method} ${url}`,
              resourceType: this.extractResource(url),
              resourceId: responseData?.id || body?.id,
              details: { statusCode: 200 },
              ipAddress: ip,
              userAgent: req.headers['user-agent'],
            },
          }).catch(() => { /* audit log failures should never break the app */ });
        },
      }),
    );
  }

  private extractResource(url: string): string {
    // /api/appointments/123 → APPOINTMENTS
    const segments = url.replace(/^\/api\//, '').split('/');
    return (segments[0] || 'UNKNOWN').toUpperCase().replace(/-/g, '_');
  }
}
