import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LabOrderStatus } from '@prisma/client';

@Injectable()
export class LaboratoryService {
  constructor(private prisma: PrismaService) {}

  async getOrders(user: any, query: any) {
    const { status, page = 1, limit = 20 } = query;
    const where: any = {};
    if (status) where.status = status;
    if (user.role === 'DOCTOR') where.doctorId = user.doctor?.id;

    const [data, total] = await Promise.all([
      this.prisma.labOrder.findMany({
        where,
        include: {
          encounter: { include: { patient: true } },
          doctor: true,
          samples: true,
          results: true,
        },
        skip: (page - 1) * limit,
        take: +limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.labOrder.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit };
  }

  async getOrderById(id: string) {
    const order = await this.prisma.labOrder.findUnique({
      where: { id },
      include: {
        encounter: { include: { patient: true } },
        doctor: true,
        samples: true,
        results: true,
      },
    });
    if (!order) throw new NotFoundException('Lab order not found');
    return order;
  }

  async updateOrderStatus(id: string, status: string, user: any) {
    return this.prisma.labOrder.update({
      where: { id },
      data: { status: status as LabOrderStatus },
    });
  }

  async addResult(orderId: string, body: any, user: any) {
    return this.prisma.labResult.create({
      data: {
        orderId,
        parameter: body.parameter,
        value: body.value,
        unit: body.unit,
        referenceRange: body.referenceRange,
        status: body.status || 'NORMAL',
        enteredById: user.id,
        notes: body.notes,
      },
    });
  }
}
