import { Controller, Get, Patch, Query, Param, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.users.getProfile(user.id);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: any, @Body() data: any) {
    return this.users.updateProfile(user.id, data);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  getUsers(@Query() query: any, @CurrentUser() user: any) {
    return this.users.getUsers(query, user);
  }

  @Get(':id')
  getUserById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.users.getUserById(id, user);
  }
}
