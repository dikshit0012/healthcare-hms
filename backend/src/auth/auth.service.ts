import { Injectable, UnauthorizedException, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
    private email: EmailService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await argon2.hash(dto.password);
    const verificationToken = uuidv4();
    const redis = this.redis.getClient();

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          email,
          password: hash,
          role: 'PATIENT',
          status: redis ? 'PENDING_VERIFICATION' : 'ACTIVE',
          patient: {
            create: {
              fullName: dto.fullName,
              dateOfBirth: new Date(dto.dateOfBirth),
              gender: dto.gender,
              phone: dto.phone,
              email,
              address: dto.address,
              emergencyName: dto.emergencyName,
              emergencyPhone: dto.emergencyPhone,
            },
          },
        },
        include: { patient: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }

    if (redis) {
      await redis.setex(`verify:${verificationToken}`, 86400, user.id);
      await this.email.sendVerificationEmail(user.email, dto.fullName, verificationToken);
    }

    return {
      message: redis
        ? 'Registration successful. Please verify your email.'
        : 'Registration successful. You can now log in.',
      userId: user.id,
    };
  }

  async login(dto: LoginDto, ip?: string, ua?: string) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { patient: true, doctor: true, staff: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await argon2.verify(user.password, dto.password);
    if (!valid) {
      await this.audit('LOGIN_FAILED', user.id, user.role, { reason: 'wrong_password', ip });
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'SUSPENDED') throw new UnauthorizedException('Account suspended');
    if (user.status === 'PENDING_VERIFICATION') throw new UnauthorizedException('Email not verified');
    if (user.status === 'PENDING_APPROVAL') throw new UnauthorizedException('Account pending approval');

    const tokens = await this.generateTokens(user);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await this.prisma.userSession.create({
      data: { userId: user.id, ipAddress: ip, userAgent: ua, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });

    await this.audit('LOGIN', user.id, user.role, { ip });
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(token: string) {
    const rt = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: { include: { patient: true, doctor: true, staff: true } } },
    });
    if (!rt || rt.revoked || rt.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.generateTokens(rt.user);
  }

  async logout(userId: string, token?: string) {
    if (token) {
      await this.prisma.refreshToken.updateMany({
        where: { token, userId },
        data: { revoked: true },
      });
    }
    await this.audit('LOGOUT', userId, undefined, {});
    return { message: 'Logged out successfully' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { message: 'If this email exists, a reset link has been sent' };

    const token = uuidv4();
    await this.prisma.passwordReset.create({
      data: { email, token, expiresAt: new Date(Date.now() + 3600000) },
    });

    await this.email.sendPasswordReset(email, token);
    return { message: 'If this email exists, a reset link has been sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const pr = await this.prisma.passwordReset.findUnique({ where: { token } });
    if (!pr || pr.used || pr.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hash = await argon2.hash(newPassword);
    await this.prisma.user.update({
      where: { email: pr.email },
      data: { password: hash },
    });
    await this.prisma.passwordReset.update({ where: { id: pr.id }, data: { used: true } });
    return { message: 'Password reset successful' };
  }

  async verifyEmail(token: string) {
    const userId = await this.redis.getClient().get(`verify:${token}`);
    if (!userId) throw new BadRequestException('Invalid or expired token');

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, status: 'ACTIVE' },
    });
    await this.redis.getClient().del(`verify:${token}`);
    return { message: 'Email verified successfully' };
  }

  private async generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: '15m',
    });
    const refreshToken = uuidv4();
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }

  private async audit(action: string, actorId: string, actorRole: any, details: any) {
    await this.prisma.auditLog.create({
      data: { actorId, actorRole, action, resourceType: 'AUTH', details },
    });
  }
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address?: string;
  emergencyName?: string;
  emergencyPhone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
