import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './database/entities/user.entity';
import { Algorithm } from './database/entities/algorithm.entity';
import { UserAlgorithm } from './database/entities/user-algorithm.entity';
import { AuthModule } from './modules/auth/auth.module';
import { AlgorithmsModule } from './modules/algorithms/algorithms.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule } from './modules/mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().default(3306),
        DB_USER: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        JWT_SECRET: Joi.string().min(16).required(),
        JWT_EXPIRES_IN: Joi.string().default('1h'),
        // Email (optional; if missing, emails are disabled)
        EMAIL_FROM: Joi.string().email().optional(),
        EMAIL_FROM_NAME: Joi.string().optional(),
        EMAIL_USER: Joi.string().email().optional(),
        EMAIL_PASS: Joi.string().optional(),
        DOMAIN: Joi.string().optional(),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60, // 60s window
        limit: 100, // global rate limit
      },
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 3306,
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [User, Algorithm, UserAlgorithm],
        synchronize: true, // NOTE: use proper migrations in production
        logging: config.get<string>('NODE_ENV') !== 'production',
      }),
    }),
    TypeOrmModule.forFeature([User, Algorithm, UserAlgorithm]),
    AuthModule,
    AlgorithmsModule,
    ProgressModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // global rate limiting
  ],
})
export class AppModule {}
