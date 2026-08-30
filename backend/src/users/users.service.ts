import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { patient: true, doctor: true, staff: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { password, ...profile } = user;
    return profile;
  }

  async updateProfile(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: { patient: true, doctor: true, staff: true } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};
    if (data.phone) updateData.phone = data.phone;
    if (data.email) updateData.email = data.email;

    if (user.patient && data.patient) {
      await this.prisma.patient.update({ where: { id: user.patient.id }, data: data.patient });
    }
    if (user.doctor && data.doctor) {
      await this.prisma.doctor.update({ where: { id: user.doctor.id }, data: data.doctor });
    }
    if (user.staff && data.staff) {
      await this.prisma.staff.update({ where: { id: user.staff.id }, data: data.staff });
    }

    if (Object.keys(updateData).length) {
      await this.prisma.user.update({ where: { id: userId }, data: updateData });
    }

    return this.getProfile(userId);
  }

  async getUsers(query: any, currentUser: any) {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(currentUser.role)) {
      throw new ForbiddenException('Admin access required');
    }
    const { page = 1, limit = 20, role, status, search } = query;
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { patient: { fullName: { contains: search, mode: 'insensitive' } } },
        { doctor: { fullName: { contains: search, mode: 'insensitive' } } },
        { staff: { fullName: { contains: search, mode: 'insensitive' } } },
      ];
    }
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { patient: true, doctor: true, staff: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data: users.map(u => { const { password, ...rest } = u; return rest; }), total, page, limit };
  }

  async getUserById(id: string, currentUser: any) {
    if (!['ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'].includes(currentUser.role)) {
      throw new ForbiddenException();
    }
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { patient: true, doctor: { include: { department: true, branch: true } }, staff: { include: { department: true, branch: true } } },
    });
    if (!user) throw new NotFoundException();
    const { password, ...rest } = user;
    return rest;
  }
}
