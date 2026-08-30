import { Controller, Get, Post, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Get('prescriptions')
  getPrescriptions(@Request() req: any, @Query() query: any) {
    return this.pharmacyService.getPrescriptions(req.user, query);
  }

  @Get('prescriptions/:id')
  getPrescription(@Param('id') id: string) {
    return this.pharmacyService.getPrescriptionById(id);
  }

  @Post('prescriptions/:id/dispense')
  dispense(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    return this.pharmacyService.dispense(id, body, req.user);
  }

  @Get('medications')
  getMedications(@Query() query: any) {
    return this.pharmacyService.getMedications(query);
  }
}
