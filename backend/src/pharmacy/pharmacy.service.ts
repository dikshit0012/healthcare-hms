import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrescriptionStatus, DispenseStatus } from '@prisma/client';

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  async getPrescriptions(user: any, query: any) {
    const { status, page = 1, limit = 20 } = query;
    const where: any = {};
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        include: {
          encounter: { include: { patient: true } },
          doctor: true,
          items: { include: { medication: true } },
          dispensings: true,
        },
        skip: (page - 1) * limit,
        take: +limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.prescription.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit };
  }

  async getPrescriptionById(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: {
        encounter: { include: { patient: true } },
        doctor: true,
        items: { include: { medication: true } },
        dispensings: { include: { items: { include: { medication: true } } } },
      },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async dispense(prescriptionId: string, body: any, user: any) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify stock availability for all items before dispensing
      for (const item of (body.items || [])) {
        const med = await tx.medication.findUnique({ where: { id: item.medicationId } });
        if (!med) throw new NotFoundException(`Medication ${item.medicationId} not found`);
        if (med.stock < item.quantity) {
          throw new NotFoundException(`Insufficient stock for ${med.name}: available ${med.stock}, requested ${item.quantity}`);
        }
      }

      // 2. Create dispensing record
      const dispensing = await tx.pharmacyDispensing.create({
        data: {
          prescriptionId,
          pharmacistId: user.staff?.id,
          status: DispenseStatus.DISPENSED,
          dispensedAt: new Date(),
          notes: body.notes,
          items: {
            create: (body.items || []).map((item: any) => ({
              medicationId: item.medicationId,
              quantity: item.quantity,
              batchNo: item.batchNo,
            })),
          },
        },
        include: { items: { include: { medication: true } } },
      });

      // 3. Atomically decrement stock for each medication
      for (const item of (body.items || [])) {
        await tx.medication.update({
          where: { id: item.medicationId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 4. Update prescription status
      await tx.prescription.update({
        where: { id: prescriptionId },
        data: { status: PrescriptionStatus.DISPENSED },
      });

      return dispensing;
    });
  }

  async getMedications(query: any) {
    const { search, page = 1, limit = 50 } = query;
    const where: any = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      this.prisma.medication.findMany({
        where,
        skip: (page - 1) * limit,
        take: +limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.medication.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit };
  }
}
