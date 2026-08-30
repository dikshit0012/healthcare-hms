import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('laboratory')
export class LaboratoryController {
  constructor(private readonly labService: LaboratoryService) {}

  @Get('orders')
  getOrders(@Request() req: any, @Query() query: any) {
    return this.labService.getOrders(req.user, query);
  }

  @Get('orders/:id')
  getOrder(@Param('id') id: string) {
    return this.labService.getOrderById(id);
  }

  @Put('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.labService.updateOrderStatus(id, body.status, req.user);
  }

  @Post('orders/:id/results')
  addResult(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.labService.addResult(id, body, req.user);
  }
}
