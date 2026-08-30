import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvoiceStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async getInvoices(user: any, query: any) {
    const { status, page = 1, limit = 20 } = query;
    const where: any = {};
    if (status) where.status = status;
    if (user.role === 'PATIENT') where.patientId = user.patient?.id;

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          patient: true,
          encounter: true,
          items: true,
          payments: true,
        },
        skip: (page - 1) * limit,
        take: +limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);
    return { data, total, page: +page, limit: +limit };
  }

  async getInvoiceById(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: true,
        encounter: true,
        items: true,
        payments: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async createInvoice(body: any, user: any) {
    const invoiceNo = `INV-${Date.now()}`;
    const totalAmount = (body.items || []).reduce(
      (sum: number, item: any) => sum + item.unitPrice * (item.quantity || 1),
      0,
    );

    return this.prisma.invoice.create({
      data: {
        encounterId: body.encounterId,
        patientId: body.patientId,
        invoiceNo,
        status: InvoiceStatus.PENDING,
        totalAmount,
        items: {
          create: (body.items || []).map((item: any) => ({
            description: item.description,
            type: item.type,
            quantity: item.quantity || 1,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * (item.quantity || 1),
          })),
        },
      },
      include: { items: true, payments: true },
    });
  }

  async recordPayment(invoiceId: string, body: any, user: any) {
    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount: body.amount,
        method: body.method as PaymentMethod || PaymentMethod.CASH,
        transactionId: body.transactionId,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
      const status = totalPaid >= Number(invoice.totalAmount)
        ? InvoiceStatus.PAID
        : InvoiceStatus.PARTIAL;
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { paidAmount: totalPaid, status },
      });
    }

    return payment;
  }
}
