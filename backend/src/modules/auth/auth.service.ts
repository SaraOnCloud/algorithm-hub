import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

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
  ) {}

  private signToken(user: User) {
    const payload: JwtPayload = { sub: user.id, email: user.email, name: user.name };
    return this.jwt.sign(payload);
  }

  async register(email: string, password: string, name: string) {
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email ya está registrado');

    const passwordHash = await argon2.hash(password);
    const user = this.usersRepo.create({ email, name, passwordHash });
    await this.usersRepo.save(user);

    const accessToken = this.signToken(user);
    return { user: { id: user.id, email: user.email, name: user.name }, accessToken };
  }

  async login(email: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');
    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException('Credenciales inválidas');
    const accessToken = this.signToken(user);
    return { user: { id: user.id, email: user.email, name: user.name }, accessToken };
  }
}

