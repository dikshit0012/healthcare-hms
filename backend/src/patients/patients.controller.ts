import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PatientsService } from './patients.service';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private patients: PatientsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    if (!user.patient) throw new Error('Not a patient');
    return this.patients.getDashboard(user.patient.id);
  }

  @Get('records')
  getMedicalRecords(@CurrentUser() user: any) {
    if (!user.patient) throw new Error('Not a patient');
    return this.patients.getMedicalRecords(user.patient.id, user);
  }

  @Get('doctors')
  searchDoctors(@Query() query: any) {
    return this.patients.searchDoctors(query);
  }

  @Get('doctors/:id')
  getDoctorProfile(@Param('id') id: string) {
    return this.patients.getDoctorProfile(id);
  }
}
