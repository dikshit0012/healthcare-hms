import { Controller, Post, Body, Req, Get, Query, HttpCode, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.auth.register({
      ...dto,
      email: dto.email.trim().toLowerCase(),
      fullName: dto.fullName.trim(),
      phone: dto.phone.trim(),
      address: dto.address?.trim() || undefined,
      emergencyName: dto.emergencyName?.trim() || undefined,
      emergencyPhone: dto.emergencyPhone?.trim() || undefined,
    });
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    try {
      const result = await this.auth.login(dto, req.ip, req.headers['user-agent']);
      // Clear brute-force counter on success
      (req as any).__clearLoginAttempts?.();
      return result;
    } catch (err) {
      // Record failed attempt for brute-force protection
      (req as any).__recordLoginFailure?.();
      throw err;
    }
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(@Body('refreshToken') token: string) {
    return this.auth.refresh(token);
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body('refreshToken') token: string, @Req() req: any) {
    return this.auth.logout(req.user?.sub, token);
  }

  @Post('forgot-password')
  @HttpCode(200)
  async forgotPassword(@Body('email') email: string) {
    return this.auth.forgotPassword(email);
  }

  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body('token') token: string, @Body('password') password: string) {
    return this.auth.resetPassword(token, password);
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    return this.auth.verifyEmail(token);
  }
}
