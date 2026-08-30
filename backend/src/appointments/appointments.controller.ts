import { Controller, Get, Post, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  @Get('slots/:doctorId')
  getSlots(@Param('doctorId') doctorId: string, @Query('date') date: string) {
    return this.appointments.getSlots(doctorId, date);
  }

  @Post()
  @Roles('PATIENT')
  bookAppointment(@CurrentUser() user: any, @Body() data: any) {
    return this.appointments.bookAppointment(user.patient.id, data);
  }

  @Get()
  getAppointments(@CurrentUser() user: any, @Query() query: any) {
    return this.appointments.getAppointments(user, query);
  }

  @Get(':id')
  getAppointmentById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appointments.getAppointmentById(id, user);
  }

  @Patch(':id/cancel')
  cancelAppointment(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason: string) {
    return this.appointments.cancelAppointment(id, user, reason);
  }

  @Post(':id/check-in')
  @UseGuards(RolesGuard)
  @Roles('RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN')
  checkIn(@Param('id') id: string, @CurrentUser() user: any) {
    return this.appointments.checkIn(id, user);
  }
}
