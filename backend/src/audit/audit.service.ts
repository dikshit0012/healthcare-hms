import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async getLogs(user: any, query: any) {
    const { action, resourceType, page = 1, limit = 50 } = query;
    const where: any = {};
    if (action) where.action = action;
    if (resourceType) where.resourceType = resourceType;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: { actor: { select: { id: true, email: true, role: true } } },
        skip: (page - 1) * limit,
        take: +limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit };
  }

  async log(data: {
    actorId?: string;
    actorRole?: any;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({ data });
  }
}
