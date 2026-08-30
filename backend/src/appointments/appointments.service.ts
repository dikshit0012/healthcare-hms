import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../websocket/events.gateway';
import { EmailService } from '../email/email.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private ws: EventsGateway,
    private email: EmailService,
  ) {}

  async getSlots(doctorId: string, date: string) {
    const dayOfWeek = new Date(date).getDay();
    const availabilities = await this.prisma.doctorAvailability.findMany({
      where: { doctorId, dayOfWeek, isAvailable: true },
    });
    const blocked = await this.prisma.blockedDate.findFirst({
      where: { doctorId, date: new Date(date) },
    });
    if (blocked) return [];

    const booked = await this.prisma.appointment.findMany({
      where: { doctorId, appointmentDate: new Date(date), status: { notIn: ['CANCELLED', 'NO_SHOW'] } },
    });

    const slots: any[] = [];
    for (const av of availabilities) {
      let current = this.timeToMinutes(av.startTime);
      const end = this.timeToMinutes(av.endTime);
      while (current + av.slotDuration <= end) {
        const start = this.minutesToTime(current);
        const endT = this.minutesToTime(current + av.slotDuration);
        const isBooked = booked.some(b => b.startTime === start);
        if (!isBooked) slots.push({ startTime: start, endTime: endT, available: true });
        current += av.slotDuration;
      }
    }
    return slots;
  }

  async bookAppointment(patientId: string, data: any) {
    const { doctorId, appointmentDate, startTime, endTime, type, notes } = data;
    const date = new Date(appointmentDate);

    try {
      const appointment = await this.prisma.appointment.create({
        data: {
          patientId,
          doctorId,
          appointmentDate: date,
          startTime,
          endTime,
          type: type || 'IN_PERSON',
          notes,
          status: 'CONFIRMED',
        },
        include: { patient: true, doctor: true },
      });

      await this.prisma.notification.create({
        data: {
          userId: appointment.doctor.userId,
          title: 'New Appointment',
          message: `Appointment with ${appointment.patient.fullName} on ${date.toDateString()}`,
          type: 'APPOINTMENT',
          category: 'APPOINTMENT',
        },
      });

      this.ws.emitToUser(appointment.doctor.userId, 'AppointmentCreated', appointment);
      this.email.sendAppointmentConfirmation(
        appointment.patient.email,
        appointment.patient.fullName,
        { doctorName: appointment.doctor.fullName, date: date.toDateString(), time: startTime },
      );

      return appointment;
    } catch (err: any) {
      if (err.code === 'P2002') throw new BadRequestException('This slot is no longer available');
      throw err;
    }
  }

  async getAppointments(user: any, query: any) {
    const { status, page = 1, limit = 20 } = query;
    const where: any = {};
    if (user.role === 'PATIENT') where.patientId = user.patient.id;
    else if (user.role === 'DOCTOR') where.doctorId = user.doctor.id;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        include: { patient: true, doctor: true, encounter: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { appointmentDate: 'desc' },
      }),
      this.prisma.appointment.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  async getAppointmentById(id: string, user: any) {
    const apt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true, encounter: true },
    });
    if (!apt) throw new NotFoundException();
    if (user.role === 'PATIENT' && apt.patientId !== user.patient?.id) throw new ForbiddenException();
    if (user.role === 'DOCTOR' && apt.doctorId !== user.doctor?.id) throw new ForbiddenException();
    return apt;
  }

  async cancelAppointment(id: string, user: any, reason?: string) {
    const apt = await this.getAppointmentById(id, user);
    if (apt.status === 'COMPLETED' || apt.status === 'CANCELLED') {
      throw new BadRequestException('Cannot cancel this appointment');
    }
    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED', notes: reason || apt.notes },
      include: { patient: true, doctor: true },
    });
    this.ws.emitToUser(updated.doctor.userId, 'AppointmentCancelled', updated);
    return updated;
  }

  async checkIn(id: string, user: any) {
    if (!['RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      throw new ForbiddenException('Receptionist access required');
    }
    const apt = await this.prisma.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: true },
    });
    if (!apt) throw new NotFoundException();
    if (apt.status !== 'CONFIRMED') throw new BadRequestException('Appointment not confirmed');

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CHECKED_IN', checkedInAt: new Date(), checkedInBy: user.id },
    });

    const encounter = await this.prisma.encounter.create({
      data: {
        appointmentId: apt.id,
        patientId: apt.patientId,
        doctorId: apt.doctorId,
        status: 'WAITING',
      },
      include: { patient: true, doctor: true },
    });

    await this.prisma.careTeam.create({
      data: {
        encounterId: encounter.id,
        members: {
          create: { doctorId: apt.doctorId, role: 'DOCTOR' },
        },
      },
    });

    this.ws.emitToUser(encounter.doctor.userId, 'PatientCheckedIn', { encounter, appointment: updated });
    this.ws.emitToRole('NURSE', 'PatientAddedToQueue', encounter);
    this.ws.emitToRole('RECEPTIONIST', 'PatientCheckedIn', { encounter, appointment: updated });

    return { appointment: updated, encounter };
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }
}
