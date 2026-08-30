import { Controller, Get, Post, Put, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Put('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() body: any) {
    return this.adminService.updateUserStatus(id, body.status);
  }

  @Get('hospitals')
  getHospitals() {
    return this.adminService.getHospitals();
  }

  @Post('hospitals')
  createHospital(@Body() body: any) {
    return this.adminService.createHospital(body);
  }
}
