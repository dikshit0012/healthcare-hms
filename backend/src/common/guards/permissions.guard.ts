import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Authentication required');

    const requiredPermission = Reflect.getMetadata('permission', context.getHandler());
    if (!requiredPermission) return true;

    const hasPermission = await this.prisma.rolePermission.findFirst({
      where: { role: user.role, permission: { name: requiredPermission } },
    });

    if (!hasPermission) {
      throw new ForbiddenException('Permission denied');
    }
    return true;
  }
}
