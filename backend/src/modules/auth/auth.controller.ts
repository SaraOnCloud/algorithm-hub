import { Body, Controller, HttpCode, HttpStatus, Post, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Throttle } from '@nestjs/throttler';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

class ResendDto {
  @IsEmail()
  email: string;
}

class VerifyQueryDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60 } }) // 5 registrations / 60s / IP
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60 } }) // 10 login attempts / 60s / IP
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('verify')
  @Throttle({ default: { limit: 20, ttl: 60 } }) // limit verification abuse
  async verify(@Query() query: VerifyQueryDto) {
    return this.auth.verifyEmail(query.token);
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 300 } }) // 3 resends / 5min / IP
  async resend(@Body() dto: ResendDto) {
    return this.auth.resendVerification(dto.email);
  }
}
