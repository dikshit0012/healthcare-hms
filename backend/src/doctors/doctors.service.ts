import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(doctorId: string) {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [appointments, encounters, pendingLabs] = await Promise.all([
      this.prisma.appointment.count({
        where: { doctorId, appointmentDate: { gte: today, lt: tomorrow } },
      }),
      this.prisma.encounter.findMany({
        where: { doctorId, status: { in: ['WAITING', 'READY_FOR_DOCTOR', 'IN_CONSULTATION'] } },
        include: { patient: true, vitalSigns: { orderBy: { recordedAt: 'desc' }, take: 1 } },
      }),
      this.prisma.labOrder.count({
        where: { doctorId, status: { in: ['ORDERED', 'RESULT_PENDING', 'VERIFICATION_REQUIRED'] } },
      }),
    ]);

    return {
      todayAppointments: appointments,
      waitingPatients: encounters.filter(e => e.status === 'WAITING' || e.status === 'READY_FOR_DOCTOR'),
      activeConsultations: encounters.filter(e => e.status === 'IN_CONSULTATION'),
      pendingLabResults: pendingLabs,
    };
  }

  async getAvailability(doctorId: string) {
    return this.prisma.doctorAvailability.findMany({ where: { doctorId } });
  }

  async setAvailability(doctorId: string, data: any[]) {
    await this.prisma.doctorAvailability.deleteMany({ where: { doctorId } });
    return this.prisma.doctorAvailability.createMany({
      data: data.map(d => ({ ...d, doctorId })),
    });
  }

  async getPatients(doctorId: string, query: any) {
    const { search, page = 1, limit = 20 } = query;
    const where: any = { doctorId };
    if (search) {
      where.patient = { fullName: { contains: search, mode: 'insensitive' } };
    }
    const [encounters, total] = await Promise.all([
      this.prisma.encounter.findMany({
        where,
        include: { patient: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.encounter.count({ where }),
    ]);
    return { data: encounters, total, page, limit };
  }

  async getPatientRecord(encounterId: string, doctorId: string) {
    const encounter = await this.prisma.encounter.findFirst({
      where: { id: encounterId, doctorId },
      include: {
        patient: true,
        vitalSigns: { include: { recordedBy: true } },
        nurseAssessments: { include: { nurse: true } },
        clinicalNotes: true,
        diagnoses: true,
        treatmentPlans: true,
        prescriptions: { include: { items: { include: { medication: true } } } },
        labOrders: { include: { results: true, samples: true } },
        followUps: true,
      },
    });
    if (!encounter) throw new NotFoundException();
    return encounter;
  }

  async createClinicalNote(doctorId: string, data: any) {
    return this.prisma.clinicalNote.create({
      data: { ...data, doctorId },
    });
  }

  async createDiagnosis(doctorId: string, data: any) {
    return this.prisma.diagnosis.create({
      data: { ...data, doctorId },
    });
  }

  async createTreatmentPlan(data: any) {
    return this.prisma.treatmentPlan.create({ data });
  }

  async createPrescription(doctorId: string, data: any) {
    const { items, ...prescriptionData } = data;
    return this.prisma.prescription.create({
      data: {
        ...prescriptionData,
        doctorId,
        status: 'CREATED',
        items: {
          create: items.map((item: any) => ({
            medicationId: item.medicationId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantity: item.quantity,
            instructions: item.instructions,
          })),
        },
      },
      include: { items: { include: { medication: true } } },
    });
  }

  async createLabOrder(doctorId: string, data: any) {
    return this.prisma.labOrder.create({
      data: { ...data, doctorId, status: 'ORDERED' },
    });
  }

  async getAppointments(doctorId: string, query: any) {
    const { date, status, page = 1, limit = 20 } = query;
    const where: any = { doctorId };
    if (date) where.appointmentDate = new Date(date);
    if (status) where.status = status;
    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: { patient: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { appointmentDate: 'desc' },
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return { data, total, page, limit };
  }
}
