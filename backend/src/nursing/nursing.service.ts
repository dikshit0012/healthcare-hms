import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';

@Injectable()
export class NursingService {
  constructor(private prisma: PrismaService, private ws: EventsGateway) {}

  async getDashboard(staffId: string) {
    const [waiting, pendingAssessment, active, completed] = await Promise.all([
      this.prisma.encounter.count({ where: { status: 'WAITING' } }),
      this.prisma.encounter.count({ where: { status: 'NURSE_ASSESSMENT' } }),
      this.prisma.encounter.count({ where: { status: { in: ['NURSE_ASSESSMENT', 'READY_FOR_DOCTOR'] } } }),
      this.prisma.nurseAssessment.count({ where: { nurseId: staffId } }),
    ]);
    return { waiting, pendingAssessment, active, completed };
  }

  async getQueue(user: any) {
    return this.prisma.encounter.findMany({
      where: { status: { in: ['WAITING', 'NURSE_ASSESSMENT', 'READY_FOR_DOCTOR'] } },
      include: { patient: true, doctor: true, vitalSigns: true, nurseAssessments: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async recordVitals(staffId: string, data: any) {
    const vital = await this.prisma.vitalSigns.create({
      data: { ...data, recordedById: staffId, recordedAt: new Date() },
      include: { recordedBy: true, patient: true },
    });
    this.ws.emitToRole('DOCTOR', 'VitalsRecorded', vital);
    return vital;
  }

  async createAssessment(staffId: string, data: any) {
    const assessment = await this.prisma.nurseAssessment.create({
      data: { ...data, nurseId: staffId },
      include: { nurse: true, encounter: { include: { patient: true, doctor: true } } },
    });
    await this.prisma.encounter.update({
      where: { id: data.encounterId },
      data: { status: 'NURSE_ASSESSMENT' },
    });
    this.ws.emitToUser(assessment.encounter.doctor.userId, 'NurseAssessmentCompleted', assessment);
    this.ws.emitToRole('RECEPTIONIST', 'NurseAssessmentCompleted', assessment);
    return assessment;
  }

  async markReadyForDoctor(encounterId: string, staffId: string) {
    const encounter = await this.prisma.encounter.update({
      where: { id: encounterId },
      data: { status: 'READY_FOR_DOCTOR' },
      include: { patient: true, doctor: true },
    });
    this.ws.emitToUser(encounter.doctor.userId, 'PatientReadyForDoctor', encounter);
    this.ws.emitToRole('RECEPTIONIST', 'PatientReadyForDoctor', encounter);
    return encounter;
  }

  async getVitals(encounterId: string) {
    return this.prisma.vitalSigns.findMany({
      where: { encounterId },
      include: { recordedBy: true },
      orderBy: { recordedAt: 'desc' },
    });
  }
}
