import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';
import { EncounterStatus } from '@prisma/client';

@Injectable()
export class EncountersService {
  constructor(private prisma: PrismaService, private ws: EventsGateway) {}

  async getEncounters(user: any, query: any) {
    const { status, page = 1, limit = 20 } = query;
    const where: any = {};
    if (user.role === 'DOCTOR') where.doctorId = user.doctor.id;
    else if (user.role === 'PATIENT') where.patientId = user.patient.id;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.encounter.findMany({
        where,
        include: { patient: true, doctor: true, careTeam: { include: { members: { include: { doctor: true, staff: true } } } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.encounter.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async getEncounterById(id: string, user: any) {
    const enc = await this.prisma.encounter.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        appointment: true,
        vitalSigns: { include: { recordedBy: true } },
        nurseAssessments: { include: { nurse: true } },
        clinicalNotes: { include: { doctor: true } },
        diagnoses: { include: { doctor: true } },
        treatmentPlans: true,
        prescriptions: { include: { items: { include: { medication: true } }, doctor: true } },
        labOrders: { include: { results: true, samples: true, doctor: true } },
        careTeam: { include: { members: { include: { doctor: true, staff: true } } } },
        invoices: true,
        followUps: true,
      },
    });
    if (!enc) throw new NotFoundException();
    this.checkAccess(enc, user);
    return enc;
  }

  async updateStatus(id: string, status: string, user: any) {
    const enc = await this.getEncounterById(id, user);
    const validTransitions: any = {
      WAITING: ['NURSE_ASSESSMENT'],
      NURSE_ASSESSMENT: ['READY_FOR_DOCTOR'],
      READY_FOR_DOCTOR: ['IN_CONSULTATION'],
      IN_CONSULTATION: ['LAB_PENDING', 'PHARMACY_PENDING', 'BILLING_PENDING', 'COMPLETED'],
      LAB_PENDING: ['IN_CONSULTATION', 'PHARMACY_PENDING', 'BILLING_PENDING'],
      PHARMACY_PENDING: ['BILLING_PENDING', 'COMPLETED'],
      BILLING_PENDING: ['COMPLETED'],
    };
    if (!validTransitions[enc.status]?.includes(status)) {
      throw new ForbiddenException(`Cannot transition from ${enc.status} to ${status}`);
    }
    const updated = await this.prisma.encounter.update({
      where: { id },
      data: { status: status as EncounterStatus, completedAt: status === 'COMPLETED' ? new Date() : undefined },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });
    this.ws.emitToUser(updated.patient.user.id, 'EncounterUpdated', updated);
    this.ws.emitToUser(updated.doctor.user.id, 'EncounterUpdated', updated);
    return updated;
  }

  private checkAccess(encounter: any, user: any) {
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return;
    if (user.role === 'PATIENT' && encounter.patientId !== user.patient?.id) throw new ForbiddenException();
    if (user.role === 'DOCTOR' && encounter.doctorId !== user.doctor?.id) throw new ForbiddenException();
    const careTeamMember = encounter.careTeam?.members?.some((m: any) =>
      (m.doctor?.userId === user.id) || (m.staff?.userId === user.id)
    );
    if (!careTeamMember && !['NURSE', 'RECEPTIONIST', 'LAB_TECHNICIAN', 'PHARMACIST', 'BILLING_STAFF'].includes(user.role)) {
      throw new ForbiddenException();
    }
  }
}
