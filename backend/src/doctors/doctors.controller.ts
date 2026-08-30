import { Controller, Get, Post, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DoctorsService } from './doctors.service';

@Controller('doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private doctors: DoctorsService) {}

  @Get('dashboard')
  @Roles('DOCTOR')
  getDashboard(@CurrentUser() user: any) {
    if (!user.doctor) throw new Error('Not a doctor');
    return this.doctors.getDashboard(user.doctor.id);
  }

  @Get('availability')
  @Roles('DOCTOR')
  getAvailability(@CurrentUser() user: any) {
    return this.doctors.getAvailability(user.doctor.id);
  }

  @Post('availability')
  @Roles('DOCTOR')
  setAvailability(@CurrentUser() user: any, @Body() data: any[]) {
    return this.doctors.setAvailability(user.doctor.id, data);
  }

  @Get('patients')
  @Roles('DOCTOR')
  getPatients(@CurrentUser() user: any, @Query() query: any) {
    return this.doctors.getPatients(user.doctor.id, query);
  }

  @Get('patients/:encounterId/record')
  @Roles('DOCTOR')
  getPatientRecord(@Param('encounterId') id: string, @CurrentUser() user: any) {
    return this.doctors.getPatientRecord(id, user.doctor.id);
  }

  @Post('clinical-notes')
  @Roles('DOCTOR')
  createClinicalNote(@CurrentUser() user: any, @Body() data: any) {
    return this.doctors.createClinicalNote(user.doctor.id, data);
  }

  @Post('diagnoses')
  @Roles('DOCTOR')
  createDiagnosis(@CurrentUser() user: any, @Body() data: any) {
    return this.doctors.createDiagnosis(user.doctor.id, data);
  }

  @Post('treatment-plans')
  @Roles('DOCTOR')
  createTreatmentPlan(@Body() data: any) {
    return this.doctors.createTreatmentPlan(data);
  }

  @Post('prescriptions')
  @Roles('DOCTOR')
  createPrescription(@CurrentUser() user: any, @Body() data: any) {
    return this.doctors.createPrescription(user.doctor.id, data);
  }

  @Post('lab-orders')
  @Roles('DOCTOR')
  createLabOrder(@CurrentUser() user: any, @Body() data: any) {
    return this.doctors.createLabOrder(user.doctor.id, data);
  }

  @Get('appointments')
  @Roles('DOCTOR')
  getAppointments(@CurrentUser() user: any, @Query() query: any) {
    return this.doctors.getAppointments(user.doctor.id, query);
  }
}
