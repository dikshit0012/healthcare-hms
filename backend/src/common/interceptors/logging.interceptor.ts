import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url, ip } = req;
    const userId = req.user?.sub || 'anonymous';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - start;
          const status = context.switchToHttp().getResponse().statusCode;
          this.logger.log(
            `${method} ${url} ${status} ${ms}ms [user:${userId}] [ip:${ip}]`,
          );
        },
        error: (err) => {
          const ms = Date.now() - start;
          const status = err.status || 500;
          this.logger.error(
            `${method} ${url} ${status} ${ms}ms [user:${userId}] [ip:${ip}] ${err.message}`,
          );
        },
      }),
    );
  }
}
