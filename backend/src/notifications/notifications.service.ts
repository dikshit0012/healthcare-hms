import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(user: any, query: any) {
    const { read, page = 1, limit = 20 } = query;
    const where: any = { userId: user.id };
    if (read !== undefined) where.read = read === 'true';

    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip: (page - 1) * limit,
        take: +limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);
    const unreadCount = await this.prisma.notification.count({
      where: { userId: user.id, read: false },
    });
    return { data, total, unreadCount, page: +page, limit: +limit };
  }

  async markAsRead(id: string, user: any) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(user: any) {
    return this.prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true, readAt: new Date() },
    });
  }

  async createNotification(data: {
    userId?: string;
    patientId?: string;
    title: string;
    message: string;
    type?: NotificationType;
    category?: string;
  }) {
    return this.prisma.notification.create({ data });
  }
}
