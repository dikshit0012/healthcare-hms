import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          orderBy: { appointmentDate: 'desc' },
          take: 5,
          include: { doctor: true },
        },
        encounters: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: { doctor: true },
        },
        invoices: {
          where: { status: { in: ['PENDING', 'PARTIAL'] } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        notifications: {
          where: { read: false },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!patient) throw new NotFoundException();
    return {
      nextAppointment: patient.appointments.find(a => a.status === 'CONFIRMED'),
      recentAppointments: patient.appointments,
      pendingBills: patient.invoices,
      recentEncounters: patient.encounters,
      unreadNotifications: patient.notifications.length,
    };
  }

  async getMedicalRecords(patientId: string, user: any) {
    if (user.role === 'PATIENT' && user.patient?.id !== patientId) {
      throw new ForbiddenException('Access denied');
    }
    return this.prisma.encounter.findMany({
      where: { patientId },
      include: {
        doctor: true,
        vitalSigns: true,
        nurseAssessments: true,
        clinicalNotes: true,
        diagnoses: true,
        prescriptions: { include: { items: { include: { medication: true } } } },
        labOrders: { include: { results: true } },
        followUps: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async searchDoctors(query: any) {
    const { specialization, department, branch, date, feeMin, feeMax, search } = query;
    const where: any = { verificationStatus: 'VERIFIED' };
    if (specialization) where.specialization = { contains: specialization, mode: 'insensitive' };
    if (department) where.departmentId = department;
    if (branch) where.branchId = branch;
    if (feeMin !== undefined || feeMax !== undefined) {
      where.consultationFee = {};
      if (feeMin !== undefined) where.consultationFee.gte = feeMin;
      if (feeMax !== undefined) where.consultationFee.lte = feeMax;
    }
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ];
    }
    const doctors = await this.prisma.doctor.findMany({
      where,
      include: { department: true, branch: true, availabilities: true },
    });
    return doctors;
  }

  async getDoctorProfile(doctorId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { department: true, branch: true, availabilities: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }
}
