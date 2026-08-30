import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional, IsDateString, Matches } from 'class-validator';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters' })
  @MaxLength(100)
  fullName: string;

  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128)
  password: string;

  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth: string;

  @IsEnum(Gender, { message: 'Select a valid gender' })
  gender: Gender;

  @IsString()
  @Matches(/^\+?[0-9\s()\-]{7,20}$/, { message: 'Enter a valid phone number' })
  phone: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergencyName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\+?[0-9\s()\-]{7,20}$/, { message: 'Enter a valid emergency phone number' })
  emergencyPhone?: string;
}
