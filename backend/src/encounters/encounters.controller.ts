import { Controller, Get, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EncountersService } from './encounters.service';

@Controller('encounters')
@UseGuards(JwtAuthGuard)
export class EncountersController {
  constructor(private encounters: EncountersService) {}

  @Get()
  getEncounters(@CurrentUser() user: any, @Query() query: any) {
    return this.encounters.getEncounters(user, query);
  }

  @Get(':id')
  getEncounterById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.encounters.getEncounterById(id, user);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @CurrentUser() user: any) {
    return this.encounters.updateStatus(id, status, user);
  }
}
