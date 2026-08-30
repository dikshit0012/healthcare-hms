import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [totalUsers, totalPatients, totalDoctors, totalAppointments] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.patient.count(),
      this.prisma.doctor.count(),
      this.prisma.appointment.count(),
    ]);
    return { totalUsers, totalPatients, totalDoctors, totalAppointments };
  }

  async getUsers(query: any) {
    const { role, status, page = 1, limit = 20 } = query;
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, role: true, status: true,
          emailVerified: true, createdAt: true, lastLoginAt: true,
        },
        skip: (page - 1) * limit,
        take: +limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit };
  }

  async updateUserStatus(id: string, status: string) {
    return this.prisma.user.update({
      where: { id },
      data: { status: status as UserStatus },
      select: { id: true, email: true, role: true, status: true },
    });
  }

  async getHospitals() {
    return this.prisma.hospital.findMany({
      include: { branches: { include: { departments: true } } },
    });
  }

  async createHospital(data: any) {
    return this.prisma.hospital.create({ data });
  }
}
