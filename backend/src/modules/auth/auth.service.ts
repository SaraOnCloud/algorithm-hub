import { ConflictException, Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { MailerService } from '../mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

interface JwtPayload {
  sub: number;
  email: string;
  name: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    private readonly jwt: JwtService,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {}

  private signToken(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name };
    return this.jwt.sign(payload);
  }

  private generateVerificationToken(): string {
    return randomBytes(32).toString('hex');
  }

  async register(email: string, password: string, name: string) {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email is already registered');

    const passwordHash = await argon2.hash(password);
    const token = this.generateVerificationToken();
    const user = this.usersRepo.create({
      email,
      name,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken: token,
      emailVerificationSentAt: new Date(),
    });
    await this.usersRepo.save(user);

    // Send verification email (silent if disabled)
    await this.mailer.sendVerificationEmail(user.email, token);

    return {
      message: 'Account created. Check your inbox to verify your email.',
      user: { id: user.id, email: user.email, name: user.name, isEmailVerified: user.isEmailVerified },
    };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    if (!user.isEmailVerified) throw new UnauthorizedException('Email not verified');
    const accessToken = this.signToken(user);
    return { user: { id: user.id, email: user.email, name: user.name }, accessToken };
  }

  async verifyEmail(token: string) {
    if (!token) throw new BadRequestException('Token is required');
    const user = await this.usersRepo.findOne({ where: { emailVerificationToken: token } });
    if (!user) throw new BadRequestException('Invalid token');
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.usersRepo.save(user);
    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    if (user.isEmailVerified) throw new BadRequestException('Email already verified');
    const token = this.generateVerificationToken();
    user.emailVerificationToken = token;
    user.emailVerificationSentAt = new Date();
    await this.usersRepo.save(user);
    await this.mailer.sendVerificationEmail(user.email, token);
    return { message: 'Verification email resent' };
  }
}
