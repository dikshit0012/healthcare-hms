import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('invoices')
  getInvoices(@Request() req: any, @Query() query: any) {
    return this.billingService.getInvoices(req.user, query);
  }

  @Get('invoices/:id')
  getInvoice(@Param('id') id: string) {
    return this.billingService.getInvoiceById(id);
  }

  @Post('invoices')
  createInvoice(@Body() body: any, @Request() req: any) {
    return this.billingService.createInvoice(body, req.user);
  }

  @Post('invoices/:id/payments')
  recordPayment(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.billingService.recordPayment(id, body, req.user);
  }
}
