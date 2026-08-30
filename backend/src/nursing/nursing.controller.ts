import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NursingService } from './nursing.service';

@Controller('nursing')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('NURSE', 'ADMIN', 'SUPER_ADMIN')
export class NursingController {
  constructor(private nursing: NursingService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser() user: any) {
    return this.nursing.getDashboard(user.staff.id);
  }

  @Get('queue')
  getQueue() {
    return this.nursing.getQueue({});
  }

  @Post('vitals')
  recordVitals(@CurrentUser() user: any, @Body() data: any) {
    return this.nursing.recordVitals(user.staff.id, data);
  }

  @Post('assessments')
  createAssessment(@CurrentUser() user: any, @Body() data: any) {
    return this.nursing.createAssessment(user.staff.id, data);
  }

  @Patch('encounters/:id/ready')
  markReadyForDoctor(@Param('id') id: string, @CurrentUser() user: any) {
    return this.nursing.markReadyForDoctor(id, user.staff.id);
  }

  @Get('encounters/:id/vitals')
  getVitals(@Param('id') id: string) {
    return this.nursing.getVitals(id);
  }
}
